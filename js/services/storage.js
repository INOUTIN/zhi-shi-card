// 本地存储服务类
export class StorageService {
    constructor() {
        this.CARDS_KEY = 'zhishi_cards_history';
        this.MAX_CARDS = 100; // 最多保存100张卡片
        this.CARD_VERSION = '1.0'; // 数据版本，用于兼容性处理
    }

    /**
     * 保存卡片
     * @param {Object} card - 卡片对象
     * @returns {Promise<void>}
     */
    async saveCard(card) {
        try {
            const cards = await this.getAllCards();

            // 添加版本信息
            const cardWithVersion = {
                ...card,
                version: this.CARD_VERSION,
                savedAt: Date.now()
            };

            // 检查是否已存在相同ID的卡片
            const existingIndex = cards.findIndex(c => c.id === card.id);
            if (existingIndex !== -1) {
                cards[existingIndex] = cardWithVersion;
            } else {
                cards.unshift(cardWithVersion); // 添加到开头
            }

            // 限制数量
            if (cards.length > this.MAX_CARDS) {
                cards.splice(this.MAX_CARDS);
            }

            localStorage.setItem(this.CARDS_KEY, JSON.stringify(cards));
        } catch (error) {
            console.error('保存卡片失败:', error);
            throw new Error('保存失败，请检查浏览器存储空间');
        }
    }

    /**
     * 获取所有卡片
     * @returns {Promise<Array>} 卡片列表
     */
    async getAllCards() {
        try {
            const data = localStorage.getItem(this.CARDS_KEY);
            if (!data) {
                return [];
            }

            const cards = JSON.parse(data);

            // 数据迁移和兼容性处理
            return this.migrateCards(cards);
        } catch (error) {
            console.error('获取卡片失败:', error);
            return [];
        }
    }

    /**
     * 获取单张卡片
     * @param {string} id - 卡片ID
     * @returns {Promise<Object|null>} 卡片对象
     */
    async getCard(id) {
        try {
            const cards = await this.getAllCards();
            return cards.find(card => card.id === id) || null;
        } catch (error) {
            console.error('获取卡片失败:', error);
            return null;
        }
    }

    /**
     * 删除卡片
     * @param {string} id - 卡片ID
     * @returns {Promise<void>}
     */
    async deleteCard(id) {
        try {
            const cards = await this.getAllCards();
            const filteredCards = cards.filter(card => card.id !== id);
            localStorage.setItem(this.CARDS_KEY, JSON.stringify(filteredCards));
        } catch (error) {
            console.error('删除卡片失败:', error);
            throw new Error('删除失败');
        }
    }

    /**
     * 更新卡片状态
     * @param {string} id - 卡片ID
     * @param {Object} updates - 更新的数据
     * @returns {Promise<void>}
     */
    async updateCard(id, updates) {
        try {
            const cards = await this.getAllCards();
            const index = cards.findIndex(card => card.id === id);

            if (index !== -1) {
                cards[index] = { ...cards[index], ...updates };
                localStorage.setItem(this.CARDS_KEY, JSON.stringify(cards));
            }
        } catch (error) {
            console.error('更新卡片失败:', error);
            throw new Error('更新失败');
        }
    }

    /**
     * 搜索卡片
     * @param {string} query - 搜索关键词
     * @returns {Promise<Array>} 匹配的卡片列表
     */
    async searchCards(query) {
        try {
            const cards = await this.getAllCards();
            const lowerQuery = query.toLowerCase();

            return cards.filter(card =>
                card.title.toLowerCase().includes(lowerQuery) ||
                card.topic.toLowerCase().includes(lowerQuery) ||
                (card.grade && card.grade.toLowerCase().includes(lowerQuery))
            );
        } catch (error) {
            console.error('搜索卡片失败:', error);
            return [];
        }
    }

    /**
     * 按主题筛选卡片
     * @param {string} topic - 主题
     * @returns {Promise<Array>} 匹配的卡片列表
     */
    async filterByTopic(topic) {
        try {
            const cards = await this.getAllCards();
            return cards.filter(card => card.topic === topic);
        } catch (error) {
            console.error('筛选卡片失败:', error);
            return [];
        }
    }

    /**
     * 按年级筛选卡片
     * @param {string} grade - 年级
     * @returns {Promise<Array>} 匹配的卡片列表
     */
    async filterByGrade(grade) {
        try {
            const cards = await this.getAllCards();
            return cards.filter(card => card.grade === grade);
        } catch (error) {
            console.error('筛选卡片失败:', error);
            return [];
        }
    }

    /**
     * 获取统计信息
     * @returns {Promise<Object>} 统计数据
     */
    async getStats() {
        try {
            const cards = await this.getAllCards();
            const stats = {
                total: cards.length,
                byTopic: {},
                byGrade: {},
                byStatus: {
                    completed: 0,
                    generating: 0,
                    failed: 0
                }
            };

            cards.forEach(card => {
                // 按主题统计
                stats.byTopic[card.topic] = (stats.byTopic[card.topic] || 0) + 1;

                // 按年级统计
                if (card.grade) {
                    stats.byGrade[card.grade] = (stats.byGrade[card.grade] || 0) + 1;
                }

                // 按状态统计
                stats.byStatus[card.status] = (stats.byStatus[card.status] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('获取统计信息失败:', error);
            return {
                total: 0,
                byTopic: {},
                byGrade: {},
                byStatus: {
                    completed: 0,
                    generating: 0,
                    failed: 0
                }
            };
        }
    }

    /**
     * 清空所有卡片
     * @returns {Promise<void>}
     */
    async clearAll() {
        try {
            localStorage.removeItem(this.CARDS_KEY);
        } catch (error) {
            console.error('清空卡片失败:', error);
            throw new Error('清空失败');
        }
    }

    /**
     * 导出数据
     * @returns {Promise<string>} JSON字符串
     */
    async exportData() {
        try {
            const cards = await this.getAllCards();
            return JSON.stringify({
                version: this.CARD_VERSION,
                exportDate: new Date().toISOString(),
                cards
            }, null, 2);
        } catch (error) {
            console.error('导出数据失败:', error);
            throw new Error('导出失败');
        }
    }

    /**
     * 导入数据
     * @param {string} jsonData - JSON数据
     * @returns {Promise<void>}
     */
    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (!data.cards || !Array.isArray(data.cards)) {
                throw new Error('无效的数据格式');
            }

            // 迁移并验证数据
            const migratedCards = this.migrateCards(data.cards);

            // 合并现有数据
            const existingCards = await this.getAllCards();
            const allCards = [...migratedCards, ...existingCards];

            // 去重（基于ID）
            const uniqueCards = allCards.filter((card, index, self) =>
                index === self.findIndex(c => c.id === card.id)
            );

            // 限制数量并保存
            uniqueCards.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
            if (uniqueCards.length > this.MAX_CARDS) {
                uniqueCards.splice(this.MAX_CARDS);
            }

            localStorage.setItem(this.CARDS_KEY, JSON.stringify(uniqueCards));
        } catch (error) {
            console.error('导入数据失败:', error);
            throw new Error('导入失败：' + error.message);
        }
    }

    /**
     * 数据迁移和兼容性处理
     * @param {Array} cards - 原始卡片数据
     * @returns {Array} 迁移后的卡片数据
     */
    migrateCards(cards) {
        return cards.map(card => {
            // 如果卡片没有version字段，进行默认迁移
            if (!card.version) {
                return {
                    ...card,
                    version: this.CARD_VERSION,
                    // 确保必要字段存在
                    id: card.id || this.generateId(),
                    status: card.status || 'completed',
                    createdAt: card.createdAt || new Date().toISOString()
                };
            }
            return card;
        });
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 获取存储使用情况
     * @returns {Promise<Object>} 存储信息
     */
    async getStorageInfo() {
        try {
            const data = localStorage.getItem(this.CARDS_KEY);
            const size = data ? new Blob([data]).size : 0;

            return {
                used: size,
                usedFormatted: this.formatBytes(size),
                max: 5 * 1024 * 1024, // 假设限制为5MB
                maxFormatted: '5 MB',
                percentage: Math.round((size / (5 * 1024 * 1024)) * 100)
            };
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return {
                used: 0,
                usedFormatted: '0 B',
                max: '5 MB',
                percentage: 0
            };
        }
    }

    /**
     * 格式化字节数
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的字符串
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}