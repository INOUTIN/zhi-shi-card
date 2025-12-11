// 卡片生成模块
import { PollingManager } from './polling.js';

export class CardGenerator {
    constructor(apiService, storageService, promptBuilder) {
        this.api = apiService;
        this.storage = storageService;
        this.promptBuilder = promptBuilder;
        this.currentGeneration = null;
        this.pollingManager = null;
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.onErrorCallback = null;
    }

    /**
     * 生成卡片
     * @param {Object} options - 生成选项
     * @returns {Promise<string>} 卡片ID
     */
    async generateCard(options) {
        try {
            // 创建卡片记录
            const cardId = this.generateCardId();
            const card = {
                id: cardId,
                taskId: null,
                title: options.title,
                topic: options.topic,
                grade: options.grade,
                labelFormat: options.labelFormat,
                prompt: null,
                imageUrl: null,
                parameters: {
                    aspectRatio: options.aspectRatio || '3:4',
                    resolution: options.resolution || '1K',
                    outputFormat: 'png'
                },
                vocabulary: [],
                createdAt: new Date(),
                status: 'generating'
            };

            // 构建提示词
            const prompt = this.promptBuilder.buildPrompt(options);
            card.prompt = prompt;

            // 获取词汇列表
            card.vocabulary = this.promptBuilder.vocabManager.getVocabularyByGrade(
                options.grade,
                options.topic,
                15
            );

            // 保存初始卡片状态
            await this.storage.saveCard(card);

            // 准备API参数
            const apiParams = {
                model: 'nano-banana-pro',
                input: {
                    prompt: prompt,
                    aspect_ratio: options.aspectRatio || '3:4',
                    resolution: options.resolution || '1K',
                    output_format: 'png'
                }
            };

            // 调用API创建任务
            this.notifyProgress('正在创建生成任务...');
            const taskResponse = await this.api.createTask(apiParams);
            const taskId = taskResponse.data.taskId;

            // 更新卡片状态
            card.taskId = taskId;
            await this.storage.updateCard(cardId, { taskId });

            // 设置轮询
            this.currentGeneration = card;
            this.pollingManager = new PollingManager(
                this.api,
                (imageUrl) => this.handleGenerationSuccess(cardId, imageUrl),
                (error) => this.handleGenerationError(cardId, error)
            );

            // 开始轮询
            this.pollingManager.startPolling(taskId);
            this.notifyProgress('任务创建成功，正在生成图片...');

            return cardId;

        } catch (error) {
            console.error('生成卡片失败:', error);
            this.notifyError(error.message || '生成失败，请重试');
            throw error;
        }
    }

    /**
     * 处理生成成功
     * @param {string} cardId - 卡片ID
     * @param {string} imageUrl - 图片URL
     */
    async handleGenerationSuccess(cardId, imageUrl) {
        try {
            // 更新卡片状态
            await this.storage.updateCard(cardId, {
                imageUrl: imageUrl,
                status: 'completed',
                completedAt: new Date()
            });

            this.currentGeneration = null;
            this.pollingManager = null;

            this.notifyComplete(cardId);
        } catch (error) {
            console.error('更新卡片状态失败:', error);
            this.notifyError('保存卡片失败');
        }
    }

    /**
     * 处理生成失败
     * @param {string} cardId - 卡片ID
     * @param {string} error - 错误信息
     */
    async handleGenerationError(cardId, error) {
        try {
            // 更新卡片状态
            await this.storage.updateCard(cardId, {
                status: 'failed',
                error: error,
                failedAt: new Date()
            });

            this.currentGeneration = null;
            this.pollingManager = null;

            this.notifyError(error || '生成失败，请重试');
        } catch (updateError) {
            console.error('更新失败状态时出错:', updateError);
            this.notifyError('生成失败且状态更新失败');
        }
    }

    /**
     * 取消生成
     */
    cancelGeneration() {
        if (this.pollingManager) {
            this.pollingManager.stopPolling();
            this.pollingManager = null;
        }

        if (this.currentGeneration) {
            // 标记为取消状态
            this.storage.updateCard(this.currentGeneration.id, {
                status: 'cancelled',
                cancelledAt: new Date()
            });
            this.currentGeneration = null;
        }
    }

    /**
     * 暂停轮询（页面隐藏时）
     */
    pausePolling() {
        if (this.pollingManager) {
            this.pollingManager.pause();
        }
    }

    /**
     * 恢复轮询（页面显示时）
     */
    resumePolling() {
        if (this.pollingManager) {
            this.pollingManager.resume();
        }
    }

    /**
     * 重新生成卡片
     * @param {string} cardId - 原卡片ID
     * @returns {Promise<string>} 新卡片ID
     */
    async regenerateCard(cardId) {
        try {
            const originalCard = await this.storage.getCard(cardId);
            if (!originalCard) {
                throw new Error('原卡片不存在');
            }

            // 准备生成选项
            const options = {
                title: originalCard.title,
                topic: originalCard.topic,
                grade: originalCard.grade,
                labelFormat: originalCard.labelFormat,
                aspectRatio: originalCard.parameters.aspectRatio,
                resolution: originalCard.parameters.resolution
            };

            // 生成新卡片
            const newCardId = await this.generateCard(options);

            // 更新原卡片，记录重新生成关系
            await this.storage.updateCard(cardId, {
                regeneratedFrom: cardId,
                regeneratedAt: new Date()
            });

            return newCardId;

        } catch (error) {
            console.error('重新生成失败:', error);
            throw error;
        }
    }

    /**
     * 获取生成状态
     * @param {string} cardId - 卡片ID
     * @returns {Promise<Object>} 状态信息
     */
    async getGenerationStatus(cardId) {
        const card = await this.storage.getCard(cardId);
        if (!card) {
            return { status: 'not_found' };
        }

        // 如果正在生成且有taskId，可以查询实际状态
        if (card.status === 'generating' && card.taskId) {
            try {
                const taskStatus = await this.api.getTaskStatus(card.taskId);
                return {
                    status: taskStatus.data.state,
                    progress: this.getProgressFromState(taskStatus.data.state),
                    message: this.getMessageFromState(taskStatus.data.state)
                };
            } catch (error) {
                console.error('查询任务状态失败:', error);
            }
        }

        return {
            status: card.status,
            progress: card.status === 'completed' ? 100 : 0,
            message: this.getStatusMessage(card.status)
        };
    }

    /**
     * 批量生成卡片
     * @param {Array} optionsList - 生成选项列表
     * @returns {Promise<Array>} 卡片ID列表
     */
    async batchGenerate(optionsList) {
        const results = [];

        for (let i = 0; i < optionsList.length; i++) {
            try {
                this.notifyProgress(`正在生成第 ${i + 1}/${optionsList.length} 张卡片...`);
                const cardId = await this.generateCard(optionsList[i]);
                results.push({ cardId, success: true });

                // 添加延迟，避免API限流
                if (i < optionsList.length - 1) {
                    await this.delay(2000);
                }
            } catch (error) {
                console.error(`批量生成第 ${i + 1} 张卡片失败:`, error);
                results.push({ cardId: null, success: false, error: error.message });
            }
        }

        return results;
    }

    /**
     * 设置进度回调
     * @param {Function} callback - 进度回调函数
     */
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    /**
     * 设置完成回调
     * @param {Function} callback - 完成回调函数
     */
    onComplete(callback) {
        this.onCompleteCallback = callback;
    }

    /**
     * 设置错误回调
     * @param {Function} callback - 错误回调函数
     */
    onError(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * 通知进度
     * @param {string} message - 进度消息
     */
    notifyProgress(message) {
        if (this.onProgressCallback) {
            this.onProgressCallback(message);
        }
    }

    /**
     * 通知完成
     * @param {string} cardId - 卡片ID
     */
    notifyComplete(cardId) {
        if (this.onCompleteCallback) {
            this.onCompleteCallback(cardId);
        }
    }

    /**
     * 通知错误
     * @param {string} error - 错误信息
     */
    notifyError(error) {
        if (this.onErrorCallback) {
            this.onErrorCallback(error);
        }
    }

    /**
     * 生成卡片ID
     * @returns {string} 唯一ID
     */
    generateCardId() {
        return 'card_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 根据API状态获取进度
     * @param {string} state - API状态
     * @returns {number} 进度百分比
     */
    getProgressFromState(state) {
        switch (state) {
            case 'waiting':
                return 30;
            case 'processing':
                return 70;
            case 'success':
                return 100;
            case 'fail':
                return 0;
            default:
                return 10;
        }
    }

    /**
     * 根据API状态获取消息
     * @param {string} state - API状态
     * @returns {string} 状态消息
     */
    getMessageFromState(state) {
        switch (state) {
            case 'waiting':
                return '任务排队中...';
            case 'processing':
                return '正在生成图片...';
            case 'success':
                return '生成完成！';
            case 'fail':
                return '生成失败';
            default:
                return '未知状态';
        }
    }

    /**
     * 获取状态消息
     * @param {string} status - 状态
     * @returns {string} 状态消息
     */
    getStatusMessage(status) {
        switch (status) {
            case 'generating':
                return '正在生成中...';
            case 'completed':
                return '已完成';
            case 'failed':
                return '生成失败';
            case 'cancelled':
                return '已取消';
            default:
                return '未知状态';
        }
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟毫秒数
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.cancelGeneration();
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.onErrorCallback = null;
    }
}