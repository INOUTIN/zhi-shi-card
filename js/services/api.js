// API服务类 - 与Nano Banana Pro API交互
export class ApiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.kie.ai/api/v1';
        this.defaultHeaders = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * 创建生成任务
     * @param {Object} params - 生成参数
     * @returns {Promise<Object>} 任务响应
     */
    async createTask(params) {
        try {
            const response = await fetch(`${this.baseUrl}/jobs/createTask`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(params)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.msg || `HTTP错误: ${response.status}`,
                    response.status,
                    this.getErrorType(response.status, data)
                );
            }

            if (data.code !== 200) {
                throw new ApiError(
                    data.msg || '创建任务失败',
                    data.code,
                    this.getErrorType(data.code, data)
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                '网络连接错误，请检查网络连接',
                0,
                'NETWORK'
            );
        }
    }

    /**
     * 查询任务状态
     * @param {string} taskId - 任务ID
     * @returns {Promise<Object>} 任务状态响应
     */
    async getTaskStatus(taskId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(
                    data.msg || `HTTP错误: ${response.status}`,
                    response.status,
                    this.getErrorType(response.status, data)
                );
            }

            if (data.code !== 200) {
                throw new ApiError(
                    data.msg || '查询任务状态失败',
                    data.code,
                    this.getErrorType(data.code, data)
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                '网络连接错误，请检查网络连接',
                0,
                'NETWORK'
            );
        }
    }

    /**
     * 根据状态码和响应数据确定错误类型
     * @param {number} code - 状态码
     * @param {Object} data - 响应数据
     * @returns {string} 错误类型
     */
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

    /**
     * 测试API连接
     * @returns {Promise<boolean>} 连接是否成功
     */
    async testConnection() {
        try {
            // 发送一个简单的测试请求
            const testParams = {
                model: 'nano-banana-pro',
                input: {
                    prompt: 'test',
                    aspect_ratio: '1:1',
                    resolution: '1K',
                    output_format: 'png'
                }
            };

            await this.createTask(testParams);
            return true;
        } catch (error) {
            console.error('API连接测试失败:', error);
            return false;
        }
    }
}

// 自定义API错误类
export class ApiError extends Error {
    constructor(message, code, type) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.type = type;
    }

    /**
     * 获取用户友好的错误信息
     * @returns {string} 错误信息
     */
    getUserMessage() {
        switch (this.type) {
            case 'AUTH':
                return 'API密钥无效，请检查配置';
            case 'RATE_LIMIT':
                return '请求过于频繁，请稍后再试';
            case 'QUOTA':
                return 'API配额不足，请充值后再试';
            case 'SERVER':
                return '服务器错误，请稍后再试';
            case 'NETWORK':
                return '网络连接错误，请检查网络';
            default:
                return this.message || '未知错误，请重试';
        }
    }
}

// 导出错误类型常量
export const ERROR_TYPES = {
    AUTH: 'AUTH',
    RATE_LIMIT: 'RATE_LIMIT',
    QUOTA: 'QUOTA',
    SERVER: 'SERVER',
    NETWORK: 'NETWORK',
    UNKNOWN: 'UNKNOWN'
};