// 增强的提示词构建器
export class EnhancedPromptBuilder {
    constructor(vocabularyManager) {
        this.vocabManager = vocabularyManager;
    }

    /**
     * 构建完整的提示词
     * @param {Object} options - 生成选项
     * @returns {string} 完整的提示词
     */
    buildPrompt(options) {
        const { title, topic, grade, labelFormat } = options;
        const vocabulary = this.vocabManager.getVocabularyByGrade(grade, topic);

        // 构建识字标注部分
        const labelSection = this.buildLabelSection(vocabulary, labelFormat);

        return `请生成一张儿童识字小报《${topic}》，竖版 A4，学习小报版式，适合${this.getAgeRange(grade)}孩子认字与看图识物。

# 一、小报标题区（顶部）

**顶部居中大标题**：《${title}》
* **风格**：十字小报 / 儿童学习报感
* **文本要求**：大字、醒目、卡通手写体、彩色描边
* **装饰**：周围添加与 ${topic} 相关的贴纸风装饰，颜色鲜艳

# 二、小报主体（中间主画面）

画面中心是一幅 **卡通插画风的「${topic}」场景**：
* **整体气氛**：明亮、温暖、积极
* **构图**：物体边界清晰，方便对应文字，不要过于拥挤。
* **透视**：适合儿童认知的平面透视风格

**场景分区与核心内容**
1. **核心区域 A（主要对象）**：表现 ${topic} 的核心活动和互动场景。
2. **核心区域 B（配套设施）**：展示相关的工具、物品或设备。
3. **核心区域 C（环境背景）**：体现环境特征（如建筑、装饰、自然元素等）。

**主题人物**
* **角色**：1-2 位可爱卡通人物（根据${topic}场景选择合适的职业/身份）。
* **动作**：正在进行与场景相关的自然互动，展现积极的学习或生活态度。
* **表情**：生动、友好，带有微笑。

# 三、必画物体与识字清单

**请务必在画面中清晰绘制以下物体，并为其预留贴标签的位置：**

${labelSection}

*(注意：画面中的物体数量不限于此，但以上列表必须作为重点描绘对象)*

# 四、识字标注规则

对上述清单中的物体，贴上中文识字标签：
* **格式**：${this.getLabelFormatDescription(labelFormat)}
* **样式**：彩色小贴纸风格，白底黑字或深色字，清晰可读
* **排版**：标签靠近对应的物体，不遮挡主体
* **大小**：适中，确保文字清晰可辨
* **排列**：尽量均匀分布，避免过度拥挤

# 五、画风参数

* **风格**：儿童绘本风 + 识字教育风
* **色彩**：高饱和、明快、温暖 (High Saturation, Warm Tone)
* **线条**：简洁流畅，粗细适中
* **质量**：8k resolution, high detail, vector illustration style, clean lines
* **光影**：柔和，不产生强烈阴影
* **背景**：简洁明快，突出主体物体

# 六、教育要求

* **准确性**：物体形象要准确反映真实特征
* **适龄性**：符合${this.getAgeRange(grade)}儿童的认知水平
* **教育性**：通过场景传递积极的生活和学习价值观
* **美观性**：整体画面色彩协调，具有视觉吸引力`;
    }

    /**
     * 构建词汇标注部分
     * @param {Array} vocabulary - 词汇列表
     * @param {string} format - 标注格式
     * @returns {string} 标注部分文本
     */
    buildLabelSection(vocabulary, format) {
        // 将词汇分成三个部分
        const sections = {
            '核心角色与设施': vocabulary.slice(0, Math.min(5, vocabulary.length)),
            '常见物品/工具': vocabulary.slice(5, Math.min(12, vocabulary.length)),
            '环境与装饰': vocabulary.slice(12, 15)
        };

        let result = '';
        for (const [sectionTitle, words] of Object.entries(sections)) {
            if (words.length === 0) continue;

            result += `**${sectionTitle}：**\n`;
            words.forEach(word => {
                const label = this.formatWordLabel(word, format);
                result += `${label}\n`;
            });
            result += '\n';
        }

        return result;
    }

    /**
     * 格式化单个词汇标签
     * @param {Object} word - 词汇对象
     * @param {string} format - 标注格式
     * @returns {string} 格式化后的标签
     */
    formatWordLabel(word, format) {
        switch (format) {
            case 'pinyin':
                return `${word.pinyin} ${word.chinese}`;
            case 'english':
                return `${word.english} ${word.chinese}`;
            case 'both':
                return `${word.pinyin} / ${word.english} ${word.chinese}`;
            default:
                return `${word.pinyin} ${word.chinese}`;
        }
    }

    /**
     * 获取年级对应的年龄范围
     * @param {string} grade - 年级
     * @returns {string} 年龄范围
     */
    getAgeRange(grade) {
        if (grade.includes('小学')) {
            const year = parseInt(grade.match(/\d+/)[0]);
            return `${6 + year}–${7 + year} 岁`;
        } else if (grade.includes('初中')) {
            const year = parseInt(grade.match(/\d+/)[0]);
            return `${12 + year}–${13 + year} 岁`;
        }
        return '5–15 岁';
    }

    /**
     * 获取标注格式的描述
     * @param {string} format - 格式类型
     * @returns {string} 格式描述
     */
    getLabelFormatDescription(format) {
        const descriptions = {
            'pinyin': '两行制（第一行拼音带声调，第二行简体汉字）',
            'english': '两行制（第一行英文单词，第二行简体汉字）',
            'both': '三行制（第一行拼音，第二行英文，第三行简体汉字）'
        };
        return descriptions[format] || descriptions['pinyin'];
    }

    /**
     * 构建简化版提示词（用于快速预览）
     * @param {Object} options - 生成选项
     * @returns {string} 简化的提示词
     */
    buildSimplePrompt(options) {
        const { title, topic, grade, labelFormat } = options;
        const vocabulary = this.vocabManager.getVocabularyByGrade(grade, topic, 10);

        const vocabList = vocabulary.slice(0, 10).map(word =>
            this.formatWordLabel(word, labelFormat)
        ).join(', ');

        return `儿童识字小报：《${title}》，主题：${topic}，适合${this.getAgeRange(grade)}。

核心词汇：${vocabList}

要求：卡通插画风格，色彩鲜艳，物体清晰，${this.getLabelFormatDescription(labelFormat)}，竖版A4。`;
    }

    /**
     * 根据难度调整提示词
     * @param {string} prompt - 原始提示词
     * @param {number} difficulty - 难度等级 (1-9)
     * @returns {string} 调整后的提示词
     */
    adjustDifficulty(prompt, difficulty) {
        let adjustedPrompt = prompt;

        // 根据难度添加特定的指导
        if (difficulty <= 2) {
            // 低年级：强调简单、直观
            adjustedPrompt += '\n\n**低年级特别要求**：\n- 物体要简单、易识别\n- 颜色对比要强烈\n- 避免复杂细节';
        } else if (difficulty <= 4) {
            // 中低年级：适中难度
            adjustedPrompt += '\n\n**中低年级特别要求**：\n- 可以包含一些简单的细节\n- 适度增加场景复杂性';
        } else if (difficulty <= 6) {
            // 中高年级：较高难度
            adjustedPrompt += '\n\n**中高年级特别要求**：\n- 可以包含更多细节和互动\n- 场景可以更丰富';
        } else {
            // 高年级：最高难度
            adjustedPrompt += '\n\n**高年级特别要求**：\n- 包含复杂的场景和细节\n- 可以展现抽象概念';
        }

        return adjustedPrompt;
    }

    /**
     * 添加特殊场景指导
     * @param {string} prompt - 原始提示词
     * @param {string} topic - 主题
     * @returns {string} 添加特殊指导后的提示词
     */
    addTopicSpecificGuidance(prompt, topic) {
        const guidance = {
            '超市': '\n\n**超市场景特别要求**：\n- 展示购物流程和文明购物行为\n- 突出健康食品的选择',
            '医院': '\n\n**医院场景特别要求**：\n- 展现友善的医患关系\n- 减少恐怖元素，强调医疗的积极作用',
            '学校': '\n\n**学校场景特别要求**：\n- 展现积极的学习氛围\n- 突出师生互动和同学友谊',
            '家庭': '\n\n**家庭场景特别要求**：\n- 展现温馨的家庭生活\n- 体现家庭成员间的关爱',
            '公园': '\n\n**公园场景特别要求**：\n- 展现自然环境和休闲娱乐\n- 强调环境保护和文明游园',
            '动物园': '\n\n**动物园场景特别要求**：\n- 展现动物的可爱和多样性\n- 传递爱护动物、保护自然的理念',
            '交通': '\n\n**交通场景特别要求**：\n- 展现各种交通工具和设施\n- 强调交通安全和规则意识'
        };

        return prompt + (guidance[topic] || '');
    }

    /**
     * 验证提示词质量
     * @param {string} prompt - 提示词
     * @returns {Object} 验证结果
     */
    validatePrompt(prompt) {
        const result = {
            isValid: true,
            issues: [],
            suggestions: []
        };

        // 检查长度
        if (prompt.length < 100) {
            result.issues.push('提示词过短');
        } else if (prompt.length > 10000) {
            result.issues.push('提示词过长，可能超出限制');
        }

        // 检查必要元素
        const requiredElements = ['标题', '词汇', '拼音', '汉字'];
        requiredElements.forEach(element => {
            if (!prompt.includes(element)) {
                result.issues.push(`缺少必要元素：${element}`);
            }
        });

        // 提供优化建议
        if (!prompt.includes('色彩')) {
            result.suggestions.push('建议添加色彩要求');
        }
        if (!prompt.includes('风格')) {
            result.suggestions.push('建议添加画风要求');
        }

        result.isValid = result.issues.length === 0;
        return result;
    }

    /**
     * 生成提示词变体
     * @param {Object} options - 基础选项
     * @param {number} count - 变体数量
     * @returns {Array} 提示词变体列表
     */
    generatePromptVariants(options, count = 3) {
        const variants = [];

        for (let i = 0; i < count; i++) {
            let variantOptions = { ...options };

            // 调整词汇选择
            const vocabulary = this.vocabManager.getVocabularyByGrade(
                options.grade,
                options.topic,
                15
            );

            // 打乱词汇顺序
            const shuffledVocab = this.shuffleArray([...vocabulary]);
            variantOptions.vocabulary = shuffledVocab;

            // 生成变体提示词
            const prompt = this.buildPrompt(variantOptions);

            // 添加一些变化
            let modifiedPrompt = prompt;
            if (i === 1) {
                modifiedPrompt = prompt.replace('明亮、温暖、积极', '活泼、欢快、有趣');
            } else if (i === 2) {
                modifiedPrompt = prompt.replace('卡通插画风', '清新绘本风');
            }

            variants.push(modifiedPrompt);
        }

        return variants;
    }

    /**
     * 打乱数组（Fisher-Yates算法）
     * @param {Array} array - 原始数组
     * @returns {Array} 打乱后的数组
     */
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}