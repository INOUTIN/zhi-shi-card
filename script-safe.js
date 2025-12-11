// 儿童识字卡片生成器 - 整合版本
// 将所有ES6模块整合到一个文件中，支持直接双击HTML文件使用

// ==================== 初始化和配置加载 ====================

// 首先定义一个函数来获取API密钥
function getApiKey() {
    // 1. 从localStorage读取（用户保存的API密钥）
    const storedKey = localStorage.getItem('api_key');
    if (storedKey) {
        return storedKey;
    }

    // 2. 如果没有配置，返回空字符串
    return '';
}

// 配置对象
const CONFIG = {
    // API配置
    API: {
        // API密钥
        KEY: getApiKey(),

        // API基础URL
        BASE_URL: 'https://api.kie.ai/api/v1',

        // 模型名称
        MODEL: 'nano-banana-pro',

        // 轮询配置
        POLLING: {
            FREQUENCY: 2000,  // 2秒
            MAX_TIME: 5 * 60 * 1000,  // 5分钟
            MAX_RETRIES: 3
        },

        // 默认参数
        DEFAULT_PARAMS: {
            aspect_ratio: '3:4',
            resolution: '1K',
            output_format: 'png'
        }
    },

    // 存储配置
    STORAGE: {
        CARDS_KEY: 'zhishi_cards_history',
        VOCABULARY_KEY: 'vocabulary_db',
        MAX_CARDS: 100,
        CARD_VERSION: '1.0'
    },

    // UI配置
    UI: {
        TOAST_DURATION: 3000,
        ANIMATION_DURATION: 300,
        LOADING_TIMEOUT: 60000,  // 1分钟
        IMAGE_PLACEHOLDER: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA3NUM4NSA2NS44IDkyLjggNTggMTAwIDU4QzEwNy4yIDU4IDExNSA2NS44IDExNSA3NUMxMTUgODQuMiAxMDcuMiA5MiAxMDAgOTJDOTIuOCA5MiA4NSA4NC4yIDg1IDc1WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNNzUgMTA1Qzc1IDk2LjcgODEuNyA5MCA5MCA5MEw5MCAxMjBINzVWMTA1WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNMTEwIDkwQzExOC4zIDkwIDEyNSA5Ni43IDEyNSAxMDVWMTIwSDExMFY5MFoiIGZpbGw9IiNDQ0MiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mj5DnjrDmnK/mnK/kuI3kuI08L3RleHQ+Cjwvc3ZnPgo='
    },

    // 词汇库配置
    VOCABULARY: {
        MIN_WORDS_PER_CARD: 15,
        MAX_WORDS_PER_CARD: 20
    },

    // 调试配置
    DEBUG: {
        ENABLED: false,
        LOG_LEVEL: 'info'
    },

    // 环境配置
    ENV: {
        isDevelopment: false,
        isProduction: true,
        supportsES6: typeof Promise !== 'undefined' && typeof URLSearchParams !== 'undefined'
    }
};

// ==================== 工具函数 ====================

// 日志工具
const Logger = {
    log: function(...args) {
        if (CONFIG.DEBUG.ENABLED && ['log', 'info'].includes(CONFIG.DEBUG.LOG_LEVEL)) {
            console.log('[LOG]', ...args);
        }
    },
    warn: function(...args) {
        if (CONFIG.DEBUG.ENABLED && ['log', 'info', 'warn'].includes(CONFIG.DEBUG.LOG_LEVEL)) {
            console.warn('[WARN]', ...args);
        }
    },
    error: function(...args) {
        if (CONFIG.DEBUG.ENABLED && ['error'].includes(CONFIG.DEBUG.LOG_LEVEL)) {
            console.error('[ERROR]', ...args);
        }
    }
};

// 设置API密钥
function setApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem('api_key', key.trim());
        Logger.log('API密钥已保存');
        return true;
    }
    Logger.error('无效的API密钥');
    return false;
}

// 获取API密钥
function getApiKeyFromStorage() {
    return localStorage.getItem('api_key');
}

// 清除API密钥
function clearApiKey() {
    localStorage.removeItem('api_key');
    Logger.log('API密钥已清除');
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // 设置样式
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '9999',
        fontSize: '14px',
        opacity: '0',
        transition: 'opacity 0.3s'
    });

    // 添加到页面
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, CONFIG.UI.TOAST_DURATION);
}

// 页面导航
function navigateTo(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 更新导航按钮状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // 如果是历史页面，加载历史记录
    if (pageId === 'history') {
        loadHistory();
    }
}

// 显示/隐藏生成状态
function showGenerationStatus() {
    const statusDiv = document.getElementById('generation-status');
    if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.querySelector('.progress-fill').style.width = '0%';
        statusDiv.querySelector('.status-text').textContent = '正在生成卡片，请稍候...';
    }
}

function hideGenerationStatus() {
    const statusDiv = document.getElementById('generation-status');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

// 更新生成进度
function updateGenerationProgress(progress) {
    const statusDiv = document.getElementById('generation-status');
    if (statusDiv) {
        statusDiv.querySelector('.progress-fill').style.width = `${progress}%`;
        const progressText = progress < 30 ? '正在创建任务...' :
                           progress < 70 ? '正在生成图片...' :
                           '即将完成...';
        statusDiv.querySelector('.status-text').textContent = progressText;
    }
}

// 取消生成
function cancelGeneration() {
    // 这里需要实现取消逻辑
    hideGenerationStatus();
    showToast('已取消生成', 'info');
}

// 生成器类
class CardGenerator {
    constructor(apiService, storageService, promptBuilder) {
        this.api = apiService;
        this.storage = storageService;
        this.promptBuilder = promptBuilder;
        this.currentGeneration = null;
        this.pollingManager = null;
    }

    async generateCard(options) {
        try {
            // 检查API密钥
            if (!CONFIG.API.KEY) {
                showToast('请先配置API密钥', 'error');
                showApiKeyModal();
                return;
            }

            // 验证选项
            if (!this.validateOptions(options)) {
                return;
            }

            // 显示生成状态
            showGenerationStatus();
            updateGenerationProgress(10);

            // 构建提示词
            const prompt = await this.promptBuilder.buildPrompt(options);
            Logger.log('提示词长度:', prompt.length);

            // 创建卡片记录
            const cardId = this.generateCardId();
            const card = this.createCardRecord(cardId, options);

            // 保存初始卡片记录
            await this.storage.saveCard(card);

            // 开始生成
            updateGenerationProgress(30);
            const response = await this.api.generateImage(prompt);

            if (response.success) {
                // 保存任务ID
                card.taskId = response.data.task_id;
                await this.storage.updateCard(cardId, { taskId: response.data.task_id });

                // 开始轮询结果
                updateGenerationProgress(50);
                this.currentGeneration = {
                    cardId: cardId,
                    taskId: response.data.task_id,
                    startTime: Date.now()
                };

                // 创建轮询管理器
                this.pollingManager = new PollingManager(this.api, card.taskId, {
                    onSuccess: (imageUrl) => this.handleGenerationSuccess(cardId, imageUrl),
                    onError: (error) => this.handleGenerationError(cardId, error),
                    onTimeout: () => this.handleGenerationTimeout(cardId),
                    frequency: CONFIG.API.POLLING.FREQUENCY,
                    maxTime: CONFIG.API.POLLING.MAX_TIME
                });

                this.pollingManager.start();
            } else {
                throw new Error(response.message || '创建任务失败');
            }
        } catch (error) {
            Logger.error('生成失败:', error);
            showToast(error.message || '生成失败，请重试', 'error');
            hideGenerationStatus();
        }
    }

    validateOptions(options) {
        if (!options.title || !options.title.trim()) {
            showToast('请输入卡片标题', 'error');
            return false;
        }

        if (!options.topic || !options.topic.trim()) {
            showToast('请选择主题', 'error');
            return false;
        }

        if (!options.grade) {
            showToast('请选择年级', 'error');
            return false;
        }

        return true;
    }

    generateCardId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createCardRecord(cardId, options) {
        return {
            id: cardId,
            taskId: null,
            title: options.title.trim(),
            topic: options.topic,
            grade: options.grade,
            labelFormat: options.labelFormat || 'chinese_pinyin',
            aspectRatio: options.aspectRatio || '3:4',
            resolution: options.resolution || '1K',
            prompt: null,
            imageUrl: null,
            status: 'generating',
            createdAt: new Date().toISOString(),
            completedAt: null,
            failedAt: null,
            error: null
        };
    }

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

            updateGenerationProgress(100);
            setTimeout(() => {
                hideGenerationStatus();
                showToast('卡片生成成功！', 'success');
                navigateTo('history');
            }, 500);
        } catch (error) {
            Logger.error('更新卡片状态失败:', error);
            this.notifyError('保存卡片失败');
        }
    }

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

            hideGenerationStatus();
            this.notifyError(error.message || '生成失败');
        } catch (updateError) {
            Logger.error('更新失败状态失败:', updateError);
            hideGenerationStatus();
            this.notifyError('生成失败，请重试');
        }
    }

    handleGenerationTimeout(cardId) {
        this.handleGenerationError(cardId, new Error('生成超时，请重试'));
    }

    notifyError(message) {
        showToast(message || '生成失败，请重试', 'error');
    }
}

// API服务类
class ApiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = CONFIG.API.BASE_URL;
    }

    async generateImage(prompt) {
        const params = {
            model: CONFIG.API.MODEL,
            input: {
                prompt: prompt,
                aspect_ratio: CONFIG.API.DEFAULT_PARAMS.aspect_ratio,
                resolution: CONFIG.API.DEFAULT_PARAMS.resolution,
                output_format: CONFIG.API.DEFAULT_PARAMS.output_format
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/generation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    message: this.getErrorMessage(response.status, data)
                };
            }
        } catch (error) {
            Logger.error('API请求失败:', error);
            return {
                success: false,
                message: '网络请求失败，请检查网络连接'
            };
        }
    }

    async getTaskStatus(taskId) {
        try {
            const response = await fetch(`${this.baseUrl}/generation/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    message: this.getErrorMessage(response.status, data)
                };
            }
        } catch (error) {
            Logger.error('获取任务状态失败:', error);
            return {
                success: false,
                message: '网络请求失败'
            };
        }
    }

    getErrorMessage(status, data) {
        const errorType = this.getErrorType(status, data);

        switch (errorType) {
            case 'AUTH':
                return 'API密钥无效或已过期，请重新配置';
            case 'QUOTA':
                return 'API配额不足，请检查账户余额';
            case 'RATE_LIMIT':
                return '请求频率过高，请稍后重试';
            case 'SERVER':
                return '服务器错误，请稍后重试';
            default:
                return data.message || '请求失败，请重试';
        }
    }

    getErrorType(code, data) {
        // HTTP状态码
        if (code === 401 || code === 403) {
            return 'AUTH';
        } else if (code === 402) {
            return 'QUOTA';
        } else if (code === 429) {
            return 'RATE_LIMIT';
        } else if (code >= 500) {
            return 'SERVER';
        }

        // API业务错误码
        if (data && data.failCode) {
            const failCode = data.failCode.toLowerCase();
            if (failCode.includes('auth') || failCode.includes('token')) {
                return 'AUTH';
            } else if (failCode.includes('quota') || failCode.includes('balance')) {
                return 'QUOTA';
            } else if (failCode.includes('rate') || failCode.includes('limit')) {
                return 'RATE_LIMIT';
            } else if (failCode.includes('server') || failCode.includes('internal')) {
                return 'SERVER';
            }
        }

        return 'UNKNOWN';
    }

    async testConnection() {
        // 发送一个简单的测试请求
        const testParams = {
            model: CONFIG.API.MODEL,
            input: {
                prompt: 'test',
                aspect_ratio: '1:1',
                resolution: '1K',
                output_format: 'png'
            }
        };

        const response = await fetch(`${this.baseUrl}/generation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(testParams)
        });

        return response.ok;
    }
}

// 存储服务类
class StorageService {
    constructor() {
        this.cardsKey = CONFIG.STORAGE.CARDS_KEY;
        this.vocabularyKey = CONFIG.STORAGE.VOCABULARY_KEY;
        this.maxCards = CONFIG.STORAGE.MAX_CARDS;
        this.cardVersion = CONFIG.STORAGE.CARD_VERSION;
    }

    async saveCard(card) {
        try {
            const cards = await this.getAllCards();
            cards.unshift(card);

            // 限制卡片数量
            if (cards.length > this.maxCards) {
                cards.length = this.maxCards;
            }

            localStorage.setItem(this.cardsKey, JSON.stringify(cards));
            Logger.log('卡片已保存:', card.id);
            return card;
        } catch (error) {
            Logger.error('保存卡片失败:', error);
            throw error;
        }
    }

    async getCard(cardId) {
        try {
            const cards = await this.getAllCards();
            return cards.find(card => card.id === cardId);
        } catch (error) {
            Logger.error('获取卡片失败:', error);
            return null;
        }
    }

    async updateCard(cardId, updates) {
        try {
            const cards = await this.getAllCards();
            const index = cards.findIndex(card => card.id === cardId);

            if (index !== -1) {
                cards[index] = { ...cards[index], ...updates };
                localStorage.setItem(this.cardsKey, JSON.stringify(cards));
                Logger.log('卡片已更新:', cardId);
                return cards[index];
            }

            return null;
        } catch (error) {
            Logger.error('更新卡片失败:', error);
            throw error;
        }
    }

    async deleteCard(cardId) {
        try {
            const cards = await this.getAllCards();
            const filteredCards = cards.filter(card => card.id !== cardId);
            localStorage.setItem(this.cardsKey, JSON.stringify(filteredCards));
            Logger.log('卡片已删除:', cardId);
            return true;
        } catch (error) {
            Logger.error('删除卡片失败:', error);
            throw error;
        }
    }

    async getAllCards() {
        try {
            const stored = localStorage.getItem(this.cardsKey);
            if (!stored) {
                return [];
            }

            const cards = JSON.parse(stored);
            return cards.map(card => {
                // 确保必要字段存在
                return {
                    ...card,
                    version: this.cardVersion,
                    id: card.id || this.generateId(),
                    status: card.status || 'completed',
                    createdAt: card.createdAt || new Date().toISOString()
                };
            });
        } catch (error) {
            Logger.error('获取卡片列表失败:', error);
            return [];
        }
    }

    async getCardsByPage(page = 1, pageSize = 10) {
        const allCards = await this.getAllCards();
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
            cards: allCards.slice(startIndex, endIndex),
            total: allCards.length,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(allCards.length / pageSize)
        };
    }

    async searchCards(query) {
        const allCards = await this.getAllCards();
        const lowerQuery = query.toLowerCase();

        return allCards.filter(card =>
            card.title.toLowerCase().includes(lowerQuery) ||
            card.topic.toLowerCase().includes(lowerQuery) ||
            (card.grade && card.grade.toLowerCase().includes(lowerQuery))
        );
    }

    async getStatistics() {
        try {
            const allCards = await this.getAllCards();
            const stats = {
                total: allCards.length,
                byGrade: {},
                byTopic: {},
                byStatus: {},
                recent: allCards.filter(card => {
                    const cardDate = new Date(card.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return cardDate > weekAgo;
                }).length
            };

            allCards.forEach(card => {
                // 按年级统计
                if (card.grade) {
                    stats.byGrade[card.grade] = (stats.byGrade[card.grade] || 0) + 1;
                }

                // 按主题统计
                if (card.topic) {
                    stats.byTopic[card.topic] = (stats.byTopic[card.topic] || 0) + 1;
                }

                // 按状态统计
                stats.byStatus[card.status] = (stats.byStatus[card.status] || 0) + 1;
            });

            return stats;
        } catch (error) {
            Logger.error('获取统计信息失败:', error);
            return {
                total: 0,
                byGrade: {},
                byTopic: {},
                byStatus: {},
                recent: 0
            };
        }
    }

    clearAll() {
        localStorage.removeItem(this.cardsKey);
        localStorage.removeItem(this.vocabularyKey);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// 轮询管理器类
class PollingManager {
    constructor(apiService, taskId, options = {}) {
        this.api = apiService;
        this.taskId = taskId;
        this.options = {
            onSuccess: options.onSuccess || (() => {}),
            onError: options.onError || (() => {}),
            onTimeout: options.onTimeout || (() => {}),
            frequency: options.frequency || 2000,
            maxTime: options.maxTime || 5 * 60 * 1000,
            maxRetries: options.maxRetries || 3
        };

        this.startTime = Date.now();
        this.retryCount = 0;
        this.timeoutId = null;
    }

    start() {
        this.poll();
        this.timeoutId = setTimeout(() => {
            this.stop();
            this.options.onTimeout();
        }, this.options.maxTime);
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    async poll() {
        try {
            const response = await this.api.getTaskStatus(this.taskId);

            if (response.success) {
                const status = response.data.state;

                if (status === 'completed') {
                    this.stop();
                    if (response.data.images && response.data.images.length > 0) {
                        this.options.onSuccess(response.data.images[0].url);
                    } else {
                        this.options.onError(new Error('生成完成但未获取到图片'));
                    }
                } else if (status === 'failed') {
                    this.stop();
                    this.options.onError(new Error(response.data.error || '生成失败'));
                } else {
                    // 继续轮询
                    setTimeout(() => this.poll(), this.options.frequency);
                }
            } else {
                this.retryCount++;
                if (this.retryCount >= this.options.maxRetries) {
                    this.stop();
                    this.options.onError(new Error(response.message || '轮询失败'));
                } else {
                    setTimeout(() => this.poll(), this.options.frequency);
                }
            }
        } catch (error) {
            Logger.error('轮询错误:', error);
            this.retryCount++;
            if (this.retryCount >= this.options.maxRetries) {
                this.stop();
                this.options.onError(error);
            } else {
                setTimeout(() => this.poll(), this.options.frequency);
            }
        }
    }
}

// 词汇管理器类
class VocabularyManager {
    constructor() {
        this.topics = ['超市', '医院', '公园', '学校', '家庭', '动物园', '交通'];
        this.vocabularyDB = this.loadVocabularyDB();
    }

    loadVocabularyDB() {
        // 这里可以加载更完整的词汇库
        return {
            '小学1年级': {
                '超市': ['苹果', '香蕉', '牛奶', '面包', '鸡蛋', '西红柿', '胡萝卜', '大米', '油', '盐', '糖', '醋', '酱油', '饼干', '蛋糕'],
                '医院': ['医生', '护士', '病人', '药', '体温计', '创可贴', '挂号', '看病', '打针', '吃药', '病床', '手术', '康复', '健康', '身体'],
                '公园': ['树', '花', '草', '湖', '桥', '亭子', '滑梯', '秋千', '长椅', '鸽子', '蝴蝶', '蜜蜂', '蚂蚁', '鸟', '鱼'],
                '学校': ['老师', '学生', '课本', '铅笔', '橡皮', '尺子', '书包', '黑板', '桌椅', '操场', '教室', '铃声', '作业', '考试', '分数'],
                '家庭': ['爸爸', '妈妈', '爷爷', '奶奶', '哥哥', '姐姐', '弟弟', '妹妹', '家', '门', '窗', '床', '桌子', '椅子'],
                '动物园': ['狮子', '老虎', '大象', '猴子', '熊猫', '长颈鹿', '斑马', '袋鼠', '企鹅', '鹦鹉', '蛇', '乌龟', '青蛙', '鱼', '鸟'],
                '交通': ['汽车', '自行车', '公交车', '地铁', '火车', '飞机', '船', '红绿灯', '马路', '人行道', '桥', '隧道', '加油站', '停车场', '车站']
            },
            '小学2年级': {
                // 更多的词汇...
            },
            // 其他年级...
        };
    }

    getVocabularyByGrade(grade, topic, count = 15) {
        const gradeVocab = this.vocabularyDB[grade] || {};
        const topicVocab = gradeVocab[topic] || [];

        // 如果当前年级没有足够词汇，从相邻年级补充
        if (topicVocab.length < count) {
            return this.supplementVocabulary(grade, topic, count);
        }

        // 随机选择指定数量的词汇
        return this.shuffleArray(topicVocab).slice(0, count);
    }

    supplementVocabulary(grade, topic, count) {
        const allGrades = Object.keys(this.vocabularyDB);
        const currentIndex = allGrades.indexOf(grade);
        let allVocab = [];

        // 收集所有年级的词汇
        for (const g of allGrades) {
            if (this.vocabularyDB[g] && this.vocabularyDB[g][topic]) {
                allVocab = allVocab.concat(this.vocabularyDB[g][topic]);
            }
        }

        // 去重
        allVocab = [...new Set(allVocab)];

        // 随机选择
        return this.shuffleArray(allVocab).slice(0, count);
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

// 增强提示词构建器类
class EnhancedPromptBuilder {
    constructor(vocabularyManager) {
        this.vocabManager = vocabularyManager;
    }

    async buildPrompt(options) {
        const { title, topic, grade, labelFormat } = options;
        const vocabulary = this.vocabManager.getVocabularyByGrade(grade, topic);

        let prompt = `请生成一张儿童识字小报《${topic}》，竖版 A4，学习小报版式，适合${this.getAgeRange(grade)}孩子认字与看图识物。

# 一、小报标题区（顶部）

**顶部居中大标题**：《${title}》
* **风格**：十字小报 / 儿童学习报感
* **装饰**：周围添加与 ${topic} 相关的贴纸风装饰，颜色鲜艳

# 二、小报主体（中间主画面）

画面中心是一幅 **卡通插画风的「${topic}」场景**：
* **整体气氛**：明亮、温暖、积极
* **核心区域 A（主要对象）**：表现 ${topic} 的核心活动和互动场景。
* **核心区域 B（认知辅助）**：在画面一侧突出展示本课重点词汇对应的物品，每个物品都有明确的形象。
* **背景细节**：场景环境元素丰富，有引导性的视觉提示。

# 三、词汇学习区（底部）

**底部词汇栏（横向排列）**：
${vocabulary.map((word, index) => `**${index + 1}. ${word}**`).join('\n')}

* **词汇格式**：大号黑体字，清晰易读
* **辅助元素**：每个词汇上方有对应小图标提示
* **排列方式**：4-5个词一行，整齐排列

# 四、装饰元素

* **边框设计**：仿报纸边框，简洁明了
* **分割线**：各区域之间用细线或装饰带分隔
* **色彩方案**：主色调明亮，色彩丰富但不杂乱

**特别说明**：
- 所有中文字符必须为简体中文
- 图画风格要适合儿童认知，色彩明快
- 画面内容要积极健康，有教育意义
- 版面布局清晰，层次分明

${this.addTopicSpecificGuidance(topic)}
`;

        return prompt;
    }

    getAgeRange(grade) {
        const gradeMap = {
            '小学1年级': '6-7岁',
            '小学2年级': '7-8岁',
            '小学3年级': '8-9岁',
            '小学4年级': '9-10岁',
            '小学5年级': '10-11岁',
            '小学6年级': '11-12岁',
            '初中1年级': '12-13岁',
            '初中2年级': '13-14岁',
            '初中3年级': '14-15岁'
        };
        return gradeMap[grade] || '6-12岁';
    }

    addTopicSpecificGuidance(topic) {
        const guidance = {
            '超市': '\n\n**超市场景特别要求**：\n- 展示购物流程和文明购物行为\n- 突出健康食品的选择',
            '医院': '\n\n**医院场景特别要求**：\n- 展现友善的医患关系\n- 减少恐怖元素，强调医疗的积极作用',
            '学校': '\n\n**学校场景特别要求**：\n- 展现积极的学习氛围\n- 突出师生互动和同学友谊',
            '家庭': '\n\n**家庭场景特别要求**：\n- 展现温馨的家庭生活\n- 体现家庭成员间的关爱',
            '公园': '\n\n**公园场景特别要求**：\n- 展现自然环境和休闲娱乐\n- 强调环境保护和文明游园',
            '动物园': '\n\n**动物园场景特别要求**：\n- 展现动物的可爱和多样性\n- 传递爱护动物、保护自然的理念',
            '交通': '\n\n**交通场景特别要求**：\n- 展现各种交通工具和设施\n- 强调交通安全和规则意识'
        };

        return guidance[topic] || '';
    }
}

// UI管理类
class UI {
    constructor(cardGenerator) {
        this.cardGenerator = cardGenerator;
        this.currentCards = [];
        this.filteredCards = [];
    }

    async init() {
        // 初始化UI组件
        this.setupEventListeners();
        await this.loadHistory();
    }

    setupEventListeners() {
        // 页面导航
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                navigateTo(page);
            });
        });

        // 生成表单提交
        const form = document.getElementById('generator-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // 学习阶段切换
        document.querySelectorAll('input[name="stage"]').forEach(radio => {
            radio.addEventListener('change', updateGradeOptions);
        });

        // 初始化年级选项
        updateGradeOptions();

        // 主题选择变化处理（显示/隐藏自定义主题输入框）
        const topicSelect = document.getElementById('topic');
        const customTopicGroup = document.getElementById('custom-topic-group');
        const customTopicInput = document.getElementById('custom-topic');

        topicSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customTopicGroup.style.display = 'block';
                customTopicInput.focus();
            } else {
                customTopicGroup.style.display = 'none';
                customTopicInput.value = '';
            }
        });

        // 搜索输入
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(searchCards, 300));
        }
    }

    async loadHistory() {
        try {
            this.currentCards = await this.cardGenerator.storage.getAllCards();
            this.filteredCards = this.currentCards;
            this.renderCardGrid(this.filteredCards);
            this.updateEmptyState();
        } catch (error) {
            Logger.error('加载历史记录失败:', error);
            showToast('加载历史记录失败', 'error');
        }
    }

    renderCardGrid(cards) {
        const grid = document.getElementById('card-grid');
        if (!grid) return;

        grid.innerHTML = '';

        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.cardId = card.id;

        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';

        const image = document.createElement('img');
        image.className = 'card-image';
        image.alt = card.title;
        image.loading = 'lazy';

        if (card.status === 'completed' && card.imageUrl) {
            image.src = card.imageUrl;
            image.onerror = () => {
                image.src = CONFIG.UI.IMAGE_PLACEHOLDER;
                image.alt = '图片加载失败';
            };
        } else if (card.status === 'generating') {
            imageContainer.innerHTML = `
                <div class="card-loading">
                    <div class="loading"></div>
                    <p>生成中...</p>
                </div>
            `;
        } else if (card.status === 'failed') {
            imageContainer.innerHTML = `
                <div class="card-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>生成失败</p>
                </div>
            `;
        }

        imageContainer.appendChild(image);

        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.innerHTML = `
            <button class="card-action-btn" onclick="showCardModal('${card.id}')" title="预览">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            ${card.status === 'completed' ? `
                <button class="card-action-btn" onclick="downloadCard('${card.id}')" title="下载">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            ` : ''}
            <button class="card-action-btn" onclick="deleteCard('${card.id}')" title="删除">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        meta.innerHTML = `
            <span class="card-topic">${card.topic}</span>
            <span class="card-date">${this.formatDate(card.createdAt)}</span>
        `;

        cardDiv.appendChild(imageContainer);
        cardDiv.appendChild(actions);
        cardDiv.appendChild(meta);

        return cardDiv;
    }

    showCardModal(card) {
        const modal = document.getElementById('card-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalMeta = document.getElementById('modal-meta');

        if (card.status === 'completed' && card.imageUrl) {
            modalImage.src = card.imageUrl;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
            if (card.status === 'generating') {
                modalImage.parentElement.innerHTML = `
                    <div class="image-loading">
                        <div class="loading"></div>
                        <p>生成中，请稍候...</p>
                    </div>
                `;
            } else {
                modalImage.parentElement.innerHTML = `
                    <div class="image-error">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>${card.status === 'failed' ? '生成失败' : '图片不存在'}</p>
                    </div>
                `;
            }
        }

        modalTitle.textContent = card.title;
        modalMeta.textContent = `${card.topic} · ${card.grade} · ${this.formatDate(card.createdAt)}`;

        modal.classList.add('show');
        modal.dataset.cardId = card.id;

        // 禁用背景滚动
        document.body.style.overflow = 'hidden';
    }

    closeCardModal() {
        const modal = document.getElementById('card-modal');
        modal.classList.remove('show');
        delete modal.dataset.cardId;
        document.body.style.overflow = '';
    }

    async downloadCard(cardId) {
        const card = await this.cardGenerator.storage.getCard(cardId);
        if (card && card.imageUrl) {
            // 在新窗口打开图片
            window.open(card.imageUrl, '_blank');
            // 提示用户保存图片
            showToast('图片已在新窗口打开，请右键另存为', 'info');
        } else {
            showToast('卡片图片不存在', 'error');
        }
    }

    async deleteCard(cardId) {
        if (confirm('确定要删除这张卡片吗？')) {
            try {
                await this.cardGenerator.storage.deleteCard(cardId);
                await this.loadHistory();
                showToast('卡片已删除', 'success');
            } catch (error) {
                Logger.error('删除卡片失败:', error);
                showToast('删除失败，请重试', 'error');
            }
        }
    }

    filterCards(query) {
        if (!query.trim()) {
            this.filteredCards = this.currentCards;
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredCards = this.currentCards.filter(card =>
                card.title.toLowerCase().includes(lowerQuery) ||
                card.topic.toLowerCase().includes(lowerQuery) ||
                (card.grade && card.grade.toLowerCase().includes(lowerQuery))
            );
        }

        this.renderCardGrid(this.filteredCards);
        this.updateEmptyState();
    }

    updateEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const grid = document.getElementById('card-grid');

        if (this.filteredCards.length === 0) {
            emptyState.style.display = 'block';
            grid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            grid.style.display = 'grid';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(message, type = 'info') {
        showToast(message, type);
    }
}

// ==================== 全局函数 ====================

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const topicSelect = document.getElementById('topic');
    const customTopicInput = document.getElementById('custom-topic');

    // 处理自定义主题
    let topicValue = topicSelect.value;
    if (topicValue === 'custom') {
        topicValue = customTopicInput.value.trim();
    }

    const options = {
        stage: formData.get('stage'),
        grade: document.getElementById('grade').value,
        topic: topicValue,
        title: document.getElementById('title').value,
        labelFormat: formData.get('labelFormat'),
        aspectRatio: document.getElementById('aspectRatio').value,
        resolution: document.getElementById('resolution').value
    };

    // 验证表单
    if (!validateForm(options)) {
        return;
    }

    // 显示生成状态
    showGenerationStatus();

    try {
        await cardGenerator.generateCard(options);
    } catch (error) {
        console.error('生成失败:', error);
        showToast(error.message || '生成失败，请重试', 'error');
        hideGenerationStatus();
    }
}

// 表单验证
function validateForm(options) {
    if (!options.grade) {
        showToast('请选择年级', 'warning');
        return false;
    }
    if (!options.topic) {
        showToast('请选择或输入主题', 'warning');
        return false;
    }
    if (!options.title) {
        showToast('请输入卡片标题', 'warning');
        return false;
    }
    return true;
}

// 更新年级选项
function updateGradeOptions() {
    const stage = document.querySelector('input[name="stage"]:checked').value;
    const gradeSelect = document.getElementById('grade');

    gradeSelect.innerHTML = '<option value="">请选择年级</option>';

    if (stage === 'primary') {
        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('option');
            option.value = `小学${i}年级`;
            option.textContent = `小学${i}年级`;
            gradeSelect.appendChild(option);
        }
    } else if (stage === 'middle') {
        for (let i = 1; i <= 3; i++) {
            const option = document.createElement('option');
            option.value = `初中${i}年级`;
            option.textContent = `初中${i}年级`;
            gradeSelect.appendChild(option);
        }
    }
}

// 加载历史记录
async function loadHistory() {
    await ui.loadHistory();
}

// 搜索卡片
function searchCards() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        ui.filterCards(searchInput.value);
    }
}

// 清空历史
function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
        storageService.clearAll();
        loadHistory();
        showToast('历史记录已清空', 'success');
    }
}

// 显示卡片模态框
function showCardModal(cardId) {
    storageService.getCard(cardId).then(card => {
        if (card) {
            ui.showCardModal(card);
        }
    });
}

// 关闭卡片模态框
function closeCardModal() {
    ui.closeCardModal();
}

// 下载卡片
function downloadCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;
    const card = storageService.getCard(cardId);

    if (card && card.imageUrl) {
        // 在新窗口打开图片
        window.open(card.imageUrl, '_blank');
        // 提示用户保存图片
        showToast('图片已在新窗口打开，请右键另存为', 'info');
    } else {
        showToast('卡片图片不存在', 'error');
    }
}

// 分享卡片
async function shareCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;
    const card = await storageService.getCard(cardId);

    if (!card || !card.imageUrl) {
        showToast('无法分享，图片不存在', 'error');
        return;
    }

    // 创建分享菜单
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-options show';
    shareMenu.innerHTML = `
        <div class="share-option" onclick="copyShareLink('${card.imageUrl}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>复制图片链接</span>
        </div>
        <div class="share-option" onclick="downloadShareImage('${card.imageUrl}', '${card.title}_${card.topic}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>下载图片</span>
        </div>
    `;

    // 添加到页面
    document.body.appendChild(shareMenu);

    // 点击其他地方关闭
    setTimeout(() => {
        document.addEventListener('click', function closeShareMenu(e) {
            if (!shareMenu.contains(e.target)) {
                document.body.removeChild(shareMenu);
                document.removeEventListener('click', closeShareMenu);
            }
        });
    }, 100);
}

// 复制分享链接
async function copyShareLink(imageUrl) {
    try {
        await navigator.clipboard.writeText(imageUrl);
        showToast('链接已复制到剪贴板', 'success');
    } catch (error) {
        showToast('复制失败，请手动复制链接', 'error');
    }
}

// 下载分享图片
function downloadShareImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}_${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('开始下载图片', 'success');
}

// 删除卡片
async function deleteCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;

    if (confirm('确定要删除这张卡片吗？')) {
        try {
            await storageService.deleteCard(cardId);
            closeCardModal();
            loadHistory();
            showToast('卡片已删除', 'success');
        } catch (error) {
            console.error('删除失败:', error);
            showToast('删除失败，请重试', 'error');
        }
    }
}

// API密钥配置相关函数
function showApiKeyModal() {
    const modal = document.getElementById('apikey-modal');
    modal.style.display = 'flex';

    // 预填充当前API密钥
    const currentKey = getApiKeyFromStorage();
    const input = document.getElementById('api-key-input');
    if (currentKey) {
        input.value = currentKey;
    }
}

function closeApiKeyModal() {
    const modal = document.getElementById('apikey-modal');
    modal.style.display = 'none';
}

function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const apiKey = input.value.trim();

    if (!apiKey) {
        showToast('请输入API密钥', 'error');
        return;
    }

    if (setApiKey(apiKey)) {
        closeApiKeyModal();
        showToast('API密钥已保存', 'success');

        // 更新全局配置
        CONFIG.API.KEY = apiKey;
    }
}

function clearApiKey() {
    if (confirm('确定要清除API密钥吗？')) {
        clearApiKey();
        const input = document.getElementById('api-key-input');
        input.value = '';
        showToast('API密钥已清除', 'info');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 页面导航
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // 生成表单提交
    const form = document.getElementById('generator-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // 学习阶段切换
    document.querySelectorAll('input[name="stage"]').forEach(radio => {
        radio.addEventListener('change', updateGradeOptions);
    });

    // 初始化年级选项，确保页面加载时显示正确的年级列表
    updateGradeOptions();

    // 主题选择变化处理（显示/隐藏自定义主题输入框）
    const topicSelect = document.getElementById('topic');
    const customTopicGroup = document.getElementById('custom-topic-group');
    const customTopicInput = document.getElementById('custom-topic');

    topicSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customTopicGroup.style.display = 'block';
            customTopicInput.focus();
        } else {
            customTopicGroup.style.display = 'none';
            customTopicInput.value = '';
        }
    });

    // 搜索输入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchCards, 300));
    }
}

// ==================== 主入口代码 ====================

// 全局变量
let apiService;
let storageService;
let vocabularyManager;
let promptBuilder;
let cardGenerator;
let ui;

// 应用初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 检查浏览器兼容性
    if (!CONFIG.ENV.supportsES6) {
        alert('您的浏览器版本过低，请升级到最新版本的Chrome、Firefox、Safari或Edge浏览器');
        return;
    }

    // 初始化服务
    apiService = new ApiService(CONFIG.API.KEY);
    storageService = new StorageService();
    vocabularyManager = new VocabularyManager();
    promptBuilder = new EnhancedPromptBuilder(vocabularyManager);
    cardGenerator = new CardGenerator(apiService, storageService, promptBuilder);
    ui = new UI(cardGenerator);

    // 初始化UI
    await ui.init();

    // 设置事件监听
    setupEventListeners();

    // 将全局函数暴露到window
    window.showApiKeyModal = showApiKeyModal;
    window.closeApiKeyModal = closeApiKeyModal;
    window.saveApiKey = saveApiKey;
    window.clearApiKey = clearApiKey;
    window.downloadCard = downloadCard;
    window.shareCard = shareCard;
    window.copyShareLink = copyShareLink;
    window.downloadShareImage = downloadShareImage;
    window.showCardModal = showCardModal;
    window.closeCardModal = closeCardModal;
    window.deleteCard = deleteCard;
    window.searchCards = searchCards;
    window.clearHistory = clearHistory;
    window.navigateTo = navigateTo;

    console.log('应用初始化完成');
});