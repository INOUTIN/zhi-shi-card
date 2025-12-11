// UI管理模块
export class UI {
    constructor(cardGenerator) {
        this.cardGenerator = cardGenerator;
        this.currentCards = [];
        this.filteredCards = [];
        this.currentModalCard = null;
    }

    /**
     * 初始化UI
     */
    async init() {
        // 设置卡片生成器回调
        this.cardGenerator.onProgress((message) => this.showProgress(message));
        this.cardGenerator.onComplete((cardId) => this.handleCardComplete(cardId));
        this.cardGenerator.onError((error) => this.handleCardError(error));

        // 初始化页面
        await this.loadHomePage();
    }

    /**
     * 加载首页
     */
    async loadHomePage() {
        // 显示欢迎信息
        console.log('欢迎来到儿童识字卡片生成器');
    }

    /**
     * 渲染历史记录
     * @param {Array} cards - 卡片列表
     */
    renderHistory(cards) {
        const grid = document.getElementById('card-grid');
        const emptyState = document.getElementById('empty-state');

        this.currentCards = cards;
        this.filteredCards = cards;

        if (cards.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            this.renderCardGrid(cards);
        }
    }

    /**
     * 渲染卡片网格
     * @param {Array} cards - 卡片列表
     */
    renderCardGrid(cards) {
        const grid = document.getElementById('card-grid');
        grid.innerHTML = '';

        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
        });
    }

    /**
     * 创建卡片元素
     * @param {Object} card - 卡片对象
     * @returns {HTMLElement} 卡片元素
     */
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.dataset.cardId = card.id;

        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';

        const image = document.createElement('img');
        image.className = 'card-image';
        image.alt = card.title;
        image.loading = 'lazy';

        if (card.status === 'completed' && card.imageUrl) {
            image.src = card.imageUrl;
            image.onerror = () => {
                image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA3NUM4NSA2NS44IDkyLjggNTggMTAwIDU4QzEwNy4yIDU4IDExNSA2NS44IDExNSA3NUMxMTUgODQuMiAxMDcuMiA5MiAxMDAgOTJDOTIuOCA5MiA4NSA4NC4yIDg1IDc1WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNNzUgMTA1Qzc1IDk2LjcgODEuNyA5MCA5MCA5MEw5MCAxMjBINzVWMTA1WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNMTEwIDkwQzExOC4zIDkwIDEyNSA5Ni43IDEyNSAxMDVWMTIwSDExMFY5MFoiIGZpbGw9IiNDQ0MiIvPgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mj5DnjrDmnK/mnK/kuI3kuI08L3RleHQ+Cjwvc3ZnPgo=';
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

        // 创建信息区域
        const infoDiv = document.createElement('div');
        infoDiv.className = 'card-info';

        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = card.title;

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        meta.innerHTML = `
            <span class="card-topic">${card.topic}</span>
            <span class="card-date">${this.formatDate(card.createdAt)}</span>
        `;

        infoDiv.appendChild(title);
        infoDiv.appendChild(meta);

        // 创建操作按钮
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.innerHTML = `
            <button class="card-action-btn" onclick="ui.viewCard('${card.id}')" title="查看">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
            ${card.status === 'completed' ? `
                <button class="card-action-btn" onclick="ui.downloadCard('${card.id}')" title="下载">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            ` : ''}
            <button class="card-action-btn" onclick="ui.deleteCard('${card.id}')" title="删除">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;

        cardDiv.appendChild(imageContainer);
        cardDiv.appendChild(infoDiv);
        cardDiv.appendChild(actions);

        // 添加点击事件
        cardDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.card-actions')) {
                this.viewCard(card.id);
            }
        });

        return cardDiv;
    }

    /**
     * 查看卡片
     * @param {string} cardId - 卡片ID
     */
    async viewCard(cardId) {
        const card = await this.cardGenerator.storage.getCard(cardId);
        if (card) {
            this.currentModalCard = card;
            this.showCardModal(card);
        }
    }

    /**
     * 显示卡片模态框
     * @param {Object} card - 卡片对象
     */
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
                        <p>${card.error || '图片生成失败'}</p>
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

    /**
     * 下载卡片
     * @param {string} cardId - 卡片ID
     */
    async downloadCard(cardId) {
        const card = await this.cardGenerator.storage.getCard(cardId);
        if (card && card.imageUrl) {
            try {
                // 创建下载链接
                const response = await fetch(card.imageUrl);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `${card.title}_${card.topic}_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
                this.showToast('开始下载图片', 'success');
            } catch (error) {
                console.error('下载失败:', error);
                this.showToast('下载失败，请重试', 'error');
            }
        }
    }

    /**
     * 删除卡片
     * @param {string} cardId - 卡片ID
     */
    async deleteCard(cardId) {
        if (confirm('确定要删除这张卡片吗？')) {
            try {
                await this.cardGenerator.storage.deleteCard(cardId);
                this.showToast('卡片已删除', 'success');

                // 如果在历史页面，刷新列表
                if (document.getElementById('history-page').classList.contains('active')) {
                    const cards = await this.cardGenerator.storage.getAllCards();
                    this.renderHistory(cards);
                }

                // 如果在模态框中，关闭模态框
                const modal = document.getElementById('card-modal');
                if (modal.classList.contains('show')) {
                    this.closeCardModal();
                }
            } catch (error) {
                console.error('删除失败:', error);
                this.showToast('删除失败，请重试', 'error');
            }
        }
    }

    /**
     * 关闭卡片模态框
     */
    closeCardModal() {
        const modal = document.getElementById('card-modal');
        modal.classList.remove('show');
        delete modal.dataset.cardId;
        this.currentModalCard = null;
        document.body.style.overflow = '';
    }

    /**
     * 筛选卡片
     * @param {string} query - 搜索关键词
     */
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
    }

    /**
     * 显示进度
     * @param {string} message - 进度消息
     */
    showProgress(message) {
        const statusText = document.querySelector('.generation-status .status-text');
        if (statusText) {
            statusText.textContent = message;
        }
    }

    /**
     * 处理卡片生成完成
     * @param {string} cardId - 卡片ID
     */
    async handleCardComplete(cardId) {
        // 隐藏生成状态
        const status = document.getElementById('generation-status');
        const submitBtn = document.querySelector('#generator-form button[type="submit"]');

        if (status) {
            status.style.display = 'none';
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline-block';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
        }

        // 获取生成的卡片
        const card = await this.cardGenerator.storage.getCard(cardId);
        if (card) {
            this.showToast('卡片生成成功！', 'success');

            // 显示生成的卡片
            setTimeout(() => {
                this.showCardModal(card);
            }, 500);
        }
    }

    /**
     * 处理卡片生成错误
     * @param {string} error - 错误信息
     */
    handleCardError(error) {
        // 隐藏生成状态
        const status = document.getElementById('generation-status');
        const submitBtn = document.querySelector('#generator-form button[type="submit"]');

        if (status) {
            status.style.display = 'none';
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline-block';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
        }

        this.showToast(error || '生成失败，请重试', 'error');
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, warning, info)
     */
    showToast(message, type = 'info') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // 添加到页面
        document.body.appendChild(toast);

        // 触发显示动画
        requestAnimationFrame(() => {
            toast.style.animation = 'toast-slide-up 0.3s ease-out';
        });

        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'toast-slide-down 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 格式化日期
     * @param {Date|string} date - 日期
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) {
            return Math.floor(diff / 3600000) + '小时前';
        } else if (diff < 604800000) {
            return Math.floor(diff / 86400000) + '天前';
        } else {
            return d.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 添加加载动画到元素
     * @param {HTMLElement} element - 目标元素
     */
    addLoading(element) {
        element.disabled = true;
        element.innerHTML = '<span class="loading"></span> 加载中...';
    }

    /**
     * 移除元素的加载状态
     * @param {HTMLElement} element - 目标元素
     * @param {string} text - 恢复的文本
     */
    removeLoading(element, text) {
        element.disabled = false;
        element.innerHTML = text;
    }

    /**
     * 创建分享菜单
     * @returns {HTMLElement} 分享菜单元素
     */
    createShareMenu() {
        const menu = document.createElement('div');
        menu.className = 'share-menu';
        menu.innerHTML = `
            <div class="share-options">
                <div class="share-option" data-platform="wechat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.506c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                    </svg>
                    <span>微信</span>
                </div>
                <div class="share-option" data-platform="weibo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.098 20.323c-3.977.393-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.44 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.442zM7.515 17.46c-.763.41-1.694.33-2.08-.179-.382-.51-.15-1.295.523-1.749.677-.457 1.596-.408 2.048.108.456.519.307 1.365-.49 1.82-.003-.001-.007-.002-.011-.002l.01.002zm.963-1.688a.586.586 0 0 1-.757-.312.577.577 0 0 1 .315-.757c.29-.097.603.07.745.357a.585.585 0 0 1-.305.735l.002.003v.002zm3.243 1.22c-1.505.352-3.173-.254-3.724-1.35-.556-1.1.21-2.23 1.716-2.58 1.505-.354 3.175.248 3.73 1.35.556 1.105-.215 2.23-1.722 2.58zm7.112-7.404c.185-.18.375-.353.553-.543.989-1.054 1.731-2.319 1.731-3.736C21.117 2.26 17.064.014 11.89.014 6.817.014 2.757 2.164 2.757 5.864c0 1.449.77 2.87 1.794 3.939.168.176.35.34.528.504l-.003.011-.005.003c.234.212.486.41.749.593.114.082.23.164.348.242.045.035.089.064.134.096.232.153.472.295.719.423l.005.003.011.005.006-.014c.774.4 1.606.647 2.48.647 2.755 0 4.988-2.578 4.988-5.758s-2.233-5.758-4.988-5.758c-1.53 0-2.894.755-3.785 1.938-.115.037-.229.08-.34.123l-.011-.022-.01.005c-.258.109-.514.228-.759.36l-.005.012c-.152.082-.302.17-.45.26-.075.046-.15.09-.225.14-.197.133-.392.275-.576.428l-.01-.005-.005.008c-.238.195-.47.408-.685.635l-.017.02c-.205.221-.403.456-.584.702l-.007.01-.005.007c-.068.09-.135.18-.2.273-.045.064-.088.13-.131.196-.09.136-.18.274-.264.416-.03.05-.06.104-.09.156-.085.15-.166.303-.24.46-.02.042-.04.087-.058.13a7.72 7.72 0 0 0-.204.49c-.01.03-.02.057-.03.087a7.373 7.373 0 0 0-.136.446c-.015.05-.027.1-.04.15-.034.133-.065.267-.09.404-.015.058-.025.115-.037.173-.025.125-.045.253-.06.382-.01.06-.018.12-.025.18a6.37 6.37 0 0 0-.03.4c-.005.06-.007.12-.008.18a6.75 6.75 0 0 0 .03.643l.007.065c.007.074.017.15.028.223l.015.117c.01.07.023.14.036.21l.02.1c.014.07.03.14.045.21l.025.1c.017.07.036.14.056.21l.03.1c.02.07.04.14.063.21l.035.1c.023.07.048.14.074.21l.04.1c.027.07.054.14.083.21l.044.1c.03.07.06.14.09.2l.05.1c.032.07.066.14.1.2l.056.1c.036.07.072.14.11.2l.06.1c.04.07.08.14.12.2l.064.1c.043.07.087.14.132.2l.07.1c.046.07.092.14.14.2l.074.1c.05.07.1.14.15.2l.078.1c.053.07.108.14.163.2l.082.1c.056.07.114.14.172.2l.086.1c.06.07.12.14.18.2l.09.1c.064.07.13.14.195.2l.094.1c.067.07.135.14.203.2l.098.1c.07.07.14.14.21.2l.103.1c.073.07.146.14.22.2l.107.1c.076.07.152.14.23.2l.111.1c.08.07.16.14.24.2l.115.1c.083.07.167.14.25.2l.12.1c.086.07.173.14.26.2l.123.1c.09.07.18.14.27.2l.128.1c.093.07.187.14.28.2l.132.1c.097.07.194.14.29.2l.137.1c.1.07.2.14.3.2l.14.1c.104.07.208.14.31.2l.145.1c.108.07.216.14.32.2l.15.1c.112.07.224.14.33.2l.154.1c.116.07.23.14.34.2l.16.1c.12.07.24.14.35.2l.164.1c.124.07.25.14.37.2l.17.1c.128.07.256.14.38.2l.176.1c.132.07.265.14.39.2l.18.1c.136.07.27.14.4.2l.186.1c.14.07.28.14.41.2l.19.1c.144.07.285.14.42.2l.196.1c.148.07.29.14.43.2l.2.1c.152.07.3.14.44.2l.2.1c.156.07.31.14.45.2l.2.1c.16.07.32.14.46.2l.2.1c.164.07.33.14.48.2l.2.1c.168.07.34.14.5.2l.2.1c.172.07.35.14.52.2l.2.1c.176.07.36.14.54.2l.2.1c.18.07.37.14.56.2l.2.1c.184.07.38.14.58.2l.2.1c.188.07.39.14.6.2l.2.1c.192.07.4.14.62.2l.2.1c.196.07.41.14.64.2l.2.1c.2.07.42.14.66.2l.2.1c.204.07.43.14.68.2l.2.1c.208.07.44.14.7.2l.2.1c.212.07.45.14.72.2l.2.1c.216.07.46.14.74.2l.2.1c.22.07.47.14.76.2l.2.1c.224.07.48.14.78.2l.2.1c.228.07.49.14.8.2l.2.1c.232.07.5.14.82.2l.2.1c.236.07.51.14.84.2l.2.1c.24.07.52.14.86.2l.2.1c.244.07.53.14.88.2l.2.1c.248.07.54.14.9.2l.2.1c.252.07.55.14.92.2l.2.1c.256.07.56.14.94.2l.2.1c.26.07.57.14.96.2l.2.1c.264.07.58.14.98.2l.2.1c.268.07.59.14.1.2l.2.1c.272.07.6.14.1.2l.2.1c.276.07.61.14.02.2l.2.1c.28.07.62.14.04.2l.2.1c.284.07.63.14.06.2l.2.1c.288.07.64.14.08.2l.2.1c.292.07.65.14.1.2l.2.1c.296.07.66.14.12.2l.2.1c.3.07.67.14.14.2l.2.1c.304.07.68.14.16.2l.2.1c.308.07.69.14.18.2l.2.1c.312.07.7.14.2.2l.2.1c.316.07.71.14.22.2l.2.1c.32.07.72.14.24.2l.2.1c.324.07.73.14.26.2l.2.1c.328.07.74.14.28.2l.2.1c.332.07.75.14.3.2l.2.1c.336.07.76.14.32.2l.2.1c.34.07.77.14.34.2l.2.1c.344.07.78.14.36.2l.2.1c.348.07.79.14.38.2l.2.1c.352.07.8.14.4.2l.2.1c.356.07.81.14.42.2l.2.1c.36.07.82.14.44.2l.2.1c.364.07.83.14.46.2l.2.1c.368.07.84.14.48.2l.2.1c.372.07.85.14.5.2l.2.1c.376.07.86.14.52.2l.2.1c.38.07.87.14.54.2l.2.1c.384.07.88.14.56.2l.2.1c.388.07.89.14.58.2l.2.1c.392.07.9.14.6.2l.2.1c.396.07.91.14.62.2l.2.1c.4.07.92.14.64.2l.2.1c.404.07.93.14.66.2l.2.1c.408.07.94.14.68.2l.2.1c.412.07.95.14.7.2l.2.1c.416.07.96.14.72.2l.2.1c.42.07.97.14.74.2l.2.1c.424.07.98.14.76.2l.2.1c.428.07.99.14.78.2l.2.1c.432.07 1 .14.8.2l.2.1c.436.07 1.01.14.82.2l.2.1c.44.07 1.02.14.84.2l.2.1c.444.07 1.03.14.86.2l.2.1c.448.07 1.04.14.88.2l.2.1c.452.07 1.05.14.9.2l.2.1c.456.07 1.06.14.92.2l.2.1c.46.07 1.07.14.94.2l.2.1c.464.07 1.08.14.96.2l.2.1c.468.07 1.09.14.98.2l.2.1c.472.07 1.1.14 1 .2l.2.1c.476.07 1.11.14 1.02.2l.2.1c.48.07 1.12.14 1.04.2l.2.1c.484.07 1.13.14 1.06.2l.2.1c.488.07 1.14.14 1.08.2l.2.1c.492.07 1.15.14 1.1.2l.2.1c.496.07 1.16.14 1.12.2l.2.1c.5.07 1.17.14 1.14.2l.2.1c.504.07 1.18.14 1.16.2l.2.1c.508.07 1.19.14 1.18.2l.2.1c.512.07 1.2.14 1.2.2l.2.1c.516.07 1.21.14 1.22.2l.2.1c.52.07 1.22.14 1.24.2l.2.1c.524.07 1.23.14 1.26.2l.2.1c.528.07 1.24.14 1.28.2l.2.1c.532.07 1.25.14 1.3.2l.2.1c.536.07 1.26.14 1.32.2l.2.1c.54.07 1.27.14 1.34.2l.2.1c.544.07 1.28.14 1.36.2l.2.1c.548.07 1.29.14 1.38.2l.2.1c.552.07 1.3.14 1.4.2l.2.1c.556.07 1.31.14 1.42.2l.2.1c.56.07 1.32.14 1.44.2l.2.1c.564.07 1.33.14 1.46.2l.2.1c.568.07 1.34.14 1.48.2l.2.1c.572.07 1.35.14 1.5.2l.2.1c.576.07 1.36.14 1.52.2l.2.1c.58.07 1.37.14 1.54.2l.2.1c.584.07 1.38.14 1.56.2l.2.1c.588.07 1.39.14 1.58.2l.2.1c.592.07 1.4.14 1.6.2l.2.1c.596.07 1.41.14 1.62.2l.2.1c.6.07 1.42.14 1.64.2l.2.1c.604.07 1.43.14 1.66.2l.2.1c.608.07 1.44.14 1.68.2l.2.1c.612.07 1.45.14 1.7.2l.2.1c.616.07 1.46.14 1.72.2l.2.1c.62.07 1.47.14 1.74.2l.2.1c.624.07 1.48.14 1.76.2l.2.1c.628.07 1.49.14 1.78.2l.2.1c.632.07 1.5.14 1.8.2l.2.1c.636.07 1.51.14 1.82.2l.2.1c.64.07 1.52.14 1.84.2l.2.1c.644.07 1.53.14 1.86.2l.2.1c.648.07 1.54.14 1.88.2l.2.1c.652.07 1.55.14 1.9.2l.2.1c.656.07 1.56.14 1.92.2l.2.1c.66.07 1.57.14 1.94.2l.2.1c.664.07 1.58.14 1.96.2l.2.1c.668.07 1.59.14 1.98.2l.2.1c.672.07 1.6.14 2 .2l.2.1c.676.07 1.61.14 2.02.2l.2.1c.68.07 1.62.14 2.04.2l.2.1c.684.07 1.63.14 2.06.2l.2.1c.688.07 1.64.14 2.08.2l.2.1c.692.07 1.65.14 2.1.2l.2.1c.696.07 1.66.14 2.12.2l.2.1c.7.07 1.67.14 2.14.2l.2.1c.704.07 1.68.14 2.16.2l.2.1c.708.07 1.69.14 2.18.2l.2.1c.712.07 1.7.14 2.2.2l.2.1c.716.07 1.71.14 2.22.2l.2.1c.72.07 1.72.14 2.24.2l.2.1c.724.07 1.73.14 2.26.2l.2.1c.728.07 1.74.14 2.28.2l.2.1c.732.07 1.75.14 2.3.2l.2.1c.736.07 1.76.14 2.32.2l.2.1c.74.07 1.77.14 2.34.2l.2.1c.744.07 1.78.14 2.36.2l.2.1c.748.07 1.79.14 2.38.2l.2.1c.752.07 1.8.14 2.4.2l.2.1c.756.07 1.81.14 2.42.2l.2.1c.76.07 1.82.14 2.44.2l.2.1c.764.07 1.83.14 2.46.2l.2.1c.768.07 1.84.14 2.48.2l.2.1c.772.07 1.85.14 2.5.2l.2.1c.776.07 1.86.14 2.52.2l.2.1c.78.07 1.87.14 2.54.2l.2.1c.784.07 1.88.14 2.56.2l.2.1c.788.07 1.89.14 2.58.2l.2.1c.792.07 1.9.14 2.6.2l.2.1c.796.07 1.91.14 2.62.2l.2.1c.8.07 1.92.14 2.64.2l.2.1c.804.07 1.93.14 2.66.2l.2.1c.808.07 1.94.14 2.68.2l.2.1c.812.07 1.95.14 2.7.2l.2.1c.816.07 1.96.14 2.72.2l.2.1c.82.07 1.97.14 2.74.2l.2.1c.824.07 1.98.14 2.76.2l.2.1c.828.07 1.99.14 2.78.2l.2.1c.832.07 2 .14 2.8.2l.2.1c.836.07 2.01.14 2.82.2l.2.1c.84.07 2.02.14 2.84.2l.2.1c.844.07 2.03.14 2.86.2l.2.1c.848.07 2.04.14 2.88.2l.2.1c.852.07 2.05.14 2.9.2l.2.1c.856.07 2.06.14 2.92.2l.2.1c.86.07 2.07.14 2.94.2l.2.1c.864.07 2.08.14 2.96.2l.2.1c.868.07 2.09.14 2.98.2l.2.1c.872.07 2.1.14 3 .2l.2.1c.876.07 2.11.14 3.02.2l.2.1c.88.07 2.12.14 3.04.2l.2.1c.884.07 2.13.14 3.06.2l.2.1c.888.07 2.14.14 3.08.2l.2.1c.892.07 2.15.14 3.1.2l.2.1c.896.07 2.16.14 3.12.2l.2.1c.9.07 2.17.14 3.14.2l.2.1c.904.07 2.18.14 3.16.2l.2.1c.908.07 2.19.14 3.18.2l.2.1c.912.07 2.2.14 3.2.2l.2.1c.916.07 2.21.14 3.22.2l.2.1c.92.07 2.22.14 3.24.2l.2.1c.924.07 2.23.14 3.26.2l.2.1c.928.07 2.24.14 3.28.2l.2.1c.932.07 2.25.14 3.3.2l.2.1c.936.07 2.26.14 3.32.2l.2.1c.94.07 2.27.14 3.34.2l.2.1c.944.07 2.28.14 3.36.2l.2.1c.948.07 2.29.14 3.38.2l.2.1c.952.07 2.3.14 3.4.2l.2.1c.956.07 2.31.14 3.42.2l.2.1c.96.07 2.32.14 3.44.2l.2.1c.964.07 2.33.14 3.46.2l.2.1c.968.07 2.34.14 3.48.2l.2.1c.972.07 2.35.14 3.5.2l.2.1c.976.07 2.36.14 3.52.2l.2.1c.98.07 2.37.14 3.54.2l.2.1c.984.07 2.38.14 3.56.2l.2.1c.988.07 2.39.14 3.58.2l.2.1c.992.07 2.4.14 3.6.2l.2.1c.996.07 2.41.14 3.62.2l.2.1c1 .07 2.42.14 3.64.2l.2.1"/>
                    </svg>
                    <span>微博</span>
                </div>
                <div class="share-option" data-platform="link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span>复制链接</span>
                </div>
            </div>
        `;

        // 添加点击事件
        menu.querySelectorAll('.share-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const platform = option.dataset.platform;
                this.handleShare(platform);
                menu.remove();
            });
        });

        return menu;
    }

    /**
     * 处理分享
     * @param {string} platform - 分享平台
     */
    async handleShare(platform) {
        const url = window.location.href;
        const title = this.currentModalCard?.title || '知识卡片';

        switch (platform) {
            case 'wechat':
                // 微信分享需要特殊处理，这里简单复制链接
                await this.copyToClipboard(url);
                this.showToast('链接已复制，请在微信中分享', 'success');
                break;
            case 'weibo':
                window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);
                break;
            case 'link':
                await this.copyToClipboard(url);
                this.showToast('链接已复制到剪贴板', 'success');
                break;
        }
    }

    /**
     * 复制到剪贴板
     * @param {string} text - 要复制的文本
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }
}