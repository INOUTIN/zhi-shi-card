// 轮询管理模块
export class PollingManager {
    constructor(apiService, onResult, onError) {
        this.apiService = apiService;
        this.onResult = onResult;
        this.onError = onError;
        this.pollingInterval = null;
        this.maxPollingTime = 5 * 60 * 1000; // 5分钟
        this.pollingFrequency = 2000; // 2秒
        this.startTime = null;
        this.taskId = null;
        this.isPaused = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * 开始轮询
     * @param {string} taskId - 任务ID
     */
    startPolling(taskId) {
        this.taskId = taskId;
        this.startTime = Date.now();
        this.isPaused = false;
        this.retryCount = 0;

        console.log(`开始轮询任务: ${taskId}`);

        // 立即查询一次
        this.pollTask();

        // 设置定时轮询
        this.pollingInterval = setInterval(() => {
            if (!this.isPaused) {
                this.pollTask();
            }
        }, this.pollingFrequency);
    }

    /**
     * 轮询任务状态
     */
    async pollTask() {
        try {
            // 检查是否超时
            if (Date.now() - this.startTime > this.maxPollingTime) {
                this.stopPolling();
                this.onError('生成超时，请重试');
                return;
            }

            console.log(`查询任务状态: ${this.taskId}, 尝试次数: ${this.retryCount + 1}`);

            const result = await this.apiService.getTaskStatus(this.taskId);
            const state = result.data.state;

            console.log(`任务状态: ${state}`);

            // 重置重试计数
            this.retryCount = 0;

            switch (state) {
                case 'success':
                    this.handleSuccess(result);
                    break;
                case 'fail':
                    this.handleFail(result);
                    break;
                case 'waiting':
                    // 任务仍在队列中等待
                    this.handleWaiting();
                    break;
                case 'processing':
                    // 任务正在处理中
                    this.handleProcessing();
                    break;
                default:
                    console.warn('未知状态:', state);
            }

        } catch (error) {
            console.error('轮询出错:', error);
            this.handlePollingError(error);
        }
    }

    /**
     * 处理成功状态
     * @param {Object} result - API结果
     */
    handleSuccess(result) {
        console.log('任务成功完成');
        this.stopPolling();

        try {
            // 解析结果中的图片URL
            const data = JSON.parse(result.data.resultJson || '{}');
            const imageUrl = data.resultUrls?.[0];

            if (imageUrl) {
                this.onResult(imageUrl);
            } else {
                this.onError('生成成功但未获取到图片URL');
            }
        } catch (parseError) {
            console.error('解析结果失败:', parseError);
            this.onError('解析生成结果失败');
        }
    }

    /**
     * 处理失败状态
     * @param {Object} result - API结果
     */
    handleFail(result) {
        console.log('任务失败:', result.data.failMsg);
        this.stopPolling();

        const errorMessage = result.data.failMsg || '生成失败';
        this.onError(errorMessage);
    }

    /**
     * 处理等待状态
     */
    handleWaiting() {
        // 任务在队列中等待，继续轮询
        console.log('任务在队列中等待...');
    }

    /**
     * 处理处理中状态
     */
    handleProcessing() {
        // 任务正在处理，继续轮询
        console.log('任务正在处理中...');
    }

    /**
     * 处理轮询错误
     * @param {Error} error - 错误对象
     */
    handlePollingError(error) {
        this.retryCount++;

        if (this.retryCount >= this.maxRetries) {
            console.error('轮询重试次数已达上限，停止轮询');
            this.stopPolling();
            this.onError('网络错误，请重试');
        } else {
            console.log(`轮询出错，将在 ${this.pollingFrequency}ms 后重试 (${this.retryCount}/${this.maxRetries})`);
        }
    }

    /**
     * 停止轮询
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        console.log('轮询已停止');
    }

    /**
     * 暂停轮询
     */
    pause() {
        this.isPaused = true;
        console.log('轮询已暂停');
    }

    /**
     * 恢复轮询
     */
    resume() {
        this.isPaused = false;
        console.log('轮询已恢复');
    }

    /**
     * 检查是否正在轮询
     * @returns {boolean} 是否正在轮询
     */
    isPolling() {
        return this.pollingInterval !== null;
    }

    /**
     * 获取轮询统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const elapsed = this.startTime ? Date.now() - this.startTime : 0;
        return {
            taskId: this.taskId,
            isPolling: this.isPolling(),
            isPaused: this.isPaused,
            elapsedTime: elapsed,
            elapsedTimeFormatted: this.formatElapsedTime(elapsed),
            retryCount: this.retryCount,
            maxRetries: this.maxRetries,
            pollingFrequency: this.pollingFrequency,
            maxPollingTime: this.maxPollingTime
        };
    }

    /**
     * 格式化经过的时间
     * @param {number} ms - 毫秒数
     * @returns {string} 格式化的时间字符串
     */
    formatElapsedTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            return `${minutes}分${remainingSeconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 设置轮询频率
     * @param {number} frequency - 频率（毫秒）
     */
    setPollingFrequency(frequency) {
        this.pollingFrequency = frequency;

        // 如果正在轮询，重新设置定时器
        if (this.isPolling()) {
            this.stopPolling();
            this.startPolling(this.taskId);
        }
    }

    /**
     * 设置最大轮询时间
     * @param {number} time - 最大时间（毫秒）
     */
    setMaxPollingTime(time) {
        this.maxPollingTime = time;
    }

    /**
     * 设置最大重试次数
     * @param {number} retries - 重试次数
     */
    setMaxRetries(retries) {
        this.maxRetries = retries;
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.stopPolling();
        this.apiService = null;
        this.onResult = null;
        this.onError = null;
    }
}