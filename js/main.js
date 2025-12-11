// 主入口文件
import { ApiService } from './services/api.js';
import { StorageService } from './services/storage.js';
import { VocabularyManager } from './services/vocabularyManager.js';
import { EnhancedPromptBuilder } from './services/enhancedPromptBuilder.js';
import { CardGenerator } from './modules/cardGeneration.js';
import { UI } from './modules/ui.js';

// 全局变量
let apiService;
let storageService;
let vocabularyManager;
let promptBuilder;
let cardGenerator;
let ui;

// API密钥配置（实际使用时应该从环境变量或配置文件读取）
const API_KEY = 'YOUR_API_KEY_HERE'; // 请替换为实际的API密钥

// 应用初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化服务
    apiService = new ApiService(API_KEY);
    storageService = new StorageService();
    vocabularyManager = new VocabularyManager();
    promptBuilder = new EnhancedPromptBuilder(vocabularyManager);
    cardGenerator = new CardGenerator(apiService, storageService, promptBuilder);
    ui = new UI(cardGenerator);

    // 初始化UI
    await ui.init();

    // 设置事件监听
    setupEventListeners();

    console.log('应用初始化完成');
});

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

    // 搜索输入
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchCards, 300));
    }

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面隐藏时暂停轮询
            cardGenerator.pausePolling();
        } else {
            // 页面显示时恢复轮询
            cardGenerator.resumePolling();
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // ESC关闭模态框
        if (e.key === 'Escape') {
            closeCardModal();
        }
    });
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const options = {
        stage: formData.get('stage'),
        grade: document.getElementById('grade').value,
        topic: document.getElementById('topic').value,
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
        showToast('请选择主题', 'warning');
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

// 页面导航
function navigateTo(pageName) {
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // 切换页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 加载页面数据
    if (pageName === 'history') {
        loadHistory();
    }
}

// 显示生成状态
function showGenerationStatus() {
    const status = document.getElementById('generation-status');
    const submitBtn = document.querySelector('#generator-form button[type="submit"]');

    if (status) {
        status.style.display = 'block';
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline-block';
    }
}

// 隐藏生成状态
function hideGenerationStatus() {
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
}

// 取消生成
function cancelGeneration() {
    cardGenerator.cancelGeneration();
    hideGenerationStatus();
}

// 加载历史记录
async function loadHistory() {
    try {
        const cards = await storageService.getAllCards();
        ui.renderHistory(cards);
    } catch (error) {
        console.error('加载历史记录失败:', error);
        showToast('加载历史记录失败', 'error');
    }
}

// 搜索卡片
function searchCards() {
    const query = document.getElementById('search-input').value;
    ui.filterCards(query);
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
function showCardModal(card) {
    const modal = document.getElementById('card-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');

    modalImage.src = card.imageUrl;
    modalImage.alt = card.title;
    modalTitle.textContent = card.title;
    modalMeta.textContent = `${card.topic} · ${card.grade} · ${formatDate(card.createdAt)}`;

    modal.classList.add('show');
    modal.dataset.cardId = card.id;
}

// 关闭卡片模态框
function closeCardModal() {
    const modal = document.getElementById('card-modal');
    modal.classList.remove('show');
    delete modal.dataset.cardId;
}

// 下载卡片
async function downloadCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;
    const card = storageService.getCard(cardId);

    if (card && card.imageUrl) {
        try {
            // 使用 fetch 获取图片数据，避免跨域问题
            const response = await fetch(card.imageUrl);
            if (!response.ok) {
                throw new Error(`获取图片失败: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // 创建下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = `${card.title}_${card.topic}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 清理 URL 对象
            URL.revokeObjectURL(url);

            showToast('开始下载图片', 'success');
        } catch (error) {
            console.error('下载失败:', error);
            showToast('下载失败，请重试', 'error');
        }
    } else {
        showToast('卡片图片不存在或未生成完成', 'error');
    }
}

// 分享卡片
async function shareCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;
    const card = storageService.getCard(cardId);

    if (card) {
        const shareData = {
            title: card.title,
            text: `知识卡片 - ${card.topic}`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // 复制链接到剪贴板
                await navigator.clipboard.writeText(window.location.href);
                showToast('链接已复制到剪贴板', 'success');
            }
        } catch (error) {
            console.error('分享失败:', error);
            showToast('分享失败', 'error');
        }
    }
}

// 删除卡片
function deleteCard() {
    const modal = document.getElementById('card-modal');
    const cardId = modal.dataset.cardId;

    if (confirm('确定要删除这张卡片吗？')) {
        storageService.deleteCard(cardId);
        closeCardModal();
        loadHistory();
        showToast('卡片已删除', 'success');
    }
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;

    // 添加样式
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '2000',
        animation: 'toast-slide-up 0.3s ease-out'
    });

    // 设置背景色
    switch (type) {
        case 'success':
            toast.style.backgroundColor = 'var(--primary-color)';
            break;
        case 'error':
            toast.style.backgroundColor = 'var(--danger-color)';
            break;
        case 'warning':
            toast.style.backgroundColor = 'var(--warning-color)';
            break;
        default:
            toast.style.backgroundColor = 'var(--text-secondary)';
    }

    // 添加到页面
    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'toast-slide-down 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 工具函数：防抖
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

// 工具函数：格式化日期
function formatDate(date) {
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

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes toast-slide-down {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, 100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);