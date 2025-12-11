// 词汇管理器 - 管理分级词汇库
export class VocabularyManager {
    constructor() {
        this.vocabularyDB = this.loadVocabulary();
        this.topics = ['超市', '医院', '公园', '学校', '家庭', '动物园', '交通'];
        this.gradeList = [
            '小学1年级', '小学2年级', '小学3年级', '小学4年级',
            '小学5年级', '小学6年级',
            '初中1年级', '初中2年级', '初中3年级'
        ];
    }

    /**
     * 加载词汇库
     * @returns {Object} 词汇库对象
     */
    loadVocabulary() {
        // 尝试从localStorage加载自定义词汇
        const saved = localStorage.getItem('vocabulary_db');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('加载自定义词汇失败，使用默认词汇库', error);
            }
        }

        // 返回默认分级词汇库
        return this.getDefaultVocabulary();
    }

    /**
     * 获取默认词汇库
     * @returns {Object} 默认词汇库
     */
    getDefaultVocabulary() {
        return {
            '小学1年级': {
                '超市': [
                    { chinese: '苹果', pinyin: 'píng guǒ', english: 'apple', difficulty: 1, category: '水果' },
                    { chinese: '香蕉', pinyin: 'xiāng jiāo', english: 'banana', difficulty: 1, category: '水果' },
                    { chinese: '牛奶', pinyin: 'niú nǎi', english: 'milk', difficulty: 1, category: '饮品' },
                    { chinese: '面包', pinyin: 'miàn bāo', english: 'bread', difficulty: 1, category: '食品' },
                    { chinese: '收银员', pinyin: 'shōu yín yuán', english: 'cashier', difficulty: 1, category: '职业' },
                    { chinese: '货架', pinyin: 'huò jià', english: 'shelf', difficulty: 1, category: '设施' },
                    { chinese: '购物车', pinyin: 'gòu wù chē', english: 'shopping cart', difficulty: 1, category: '工具' },
                    { chinese: '入口', pinyin: 'rù kǒu', english: 'entrance', difficulty: 1, category: '标识' },
                    { chinese: '出口', pinyin: 'chū kǒu', english: 'exit', difficulty: 1, category: '标识' },
                    { chinese: '价格', pinyin: 'jià gé', english: 'price', difficulty: 1, category: '概念' },
                    { chinese: '糖果', pinyin: 'táng guǒ', english: 'candy', difficulty: 1, category: '食品' },
                    { chinese: '玩具', pinyin: 'wán jù', english: 'toy', difficulty: 1, category: '用品' },
                    { chinese: '饮料', pinyin: 'yǐn liào', english: 'drink', difficulty: 1, category: '饮品' },
                    { chinese: '蔬菜', pinyin: 'shū cài', english: 'vegetables', difficulty: 1, category: '食品' },
                    { chinese: '水果', pinyin: 'shuǐ guǒ', english: 'fruit', difficulty: 1, category: '食品' }
                ],
                '学校': [
                    { chinese: '老师', pinyin: 'lǎo shī', english: 'teacher', difficulty: 1, category: '职业' },
                    { chinese: '学生', pinyin: 'xué shēng', english: 'student', difficulty: 1, category: '身份' },
                    { chinese: '书本', pinyin: 'shū běn', english: 'book', difficulty: 1, category: '用品' },
                    { chinese: '铅笔', pinyin: 'qiān bǐ', english: 'pencil', difficulty: 1, category: '用品' },
                    { chinese: '黑板', pinyin: 'hēi bǎn', english: 'blackboard', difficulty: 1, category: '设施' },
                    { chinese: '课桌', pinyin: 'kè zhuō', english: 'desk', difficulty: 1, category: '设施' },
                    { chinese: '椅子', pinyin: 'yǐ zi', english: 'chair', difficulty: 1, category: '设施' },
                    { chinese: '教室', pinyin: 'jiào shì', english: 'classroom', difficulty: 1, category: '场所' },
                    { chinese: '操场', pinyin: 'cāo chǎng', english: 'playground', difficulty: 1, category: '场所' },
                    { chinese: '校门', pinyin: 'xiào mén', english: 'school gate', difficulty: 1, category: '建筑' },
                    { chinese: '书包', pinyin: 'shū bāo', english: 'schoolbag', difficulty: 1, category: '用品' },
                    { chinese: '橡皮', pinyin: 'xiàng pí', english: 'eraser', difficulty: 1, category: '用品' },
                    { chinese: '尺子', pinyin: 'chǐ zi', english: 'ruler', difficulty: 1, category: '用品' },
                    { chinese: '足球', pinyin: 'zú qiú', english: 'football', difficulty: 1, category: '用品' },
                    { chinese: '篮球', pinyin: 'lán qiú', english: 'basketball', difficulty: 1, category: '用品' }
                ],
                '家庭': [
                    { chinese: '爸爸', pinyin: 'bà ba', english: 'father', difficulty: 1, category: '家人' },
                    { chinese: '妈妈', pinyin: 'mā ma', english: 'mother', difficulty: 1, category: '家人' },
                    { chinese: '沙发', pinyin: 'shā fā', english: 'sofa', difficulty: 1, category: '家具' },
                    { chinese: '桌子', pinyin: 'zhuō zi', english: 'table', difficulty: 1, category: '家具' },
                    { chinese: '椅子', pinyin: 'yǐ zi', english: 'chair', difficulty: 1, category: '家具' },
                    { chinese: '床', pinyin: 'chuáng', english: 'bed', difficulty: 1, category: '家具' },
                    { chinese: '电视', pinyin: 'diàn shì', english: 'television', difficulty: 1, category: '电器' },
                    { chinese: '冰箱', pinyin: 'bīng xiāng', english: 'refrigerator', difficulty: 1, category: '电器' },
                    { chinese: '窗户', pinyin: 'chuāng hù', english: 'window', difficulty: 1, category: '建筑' },
                    { chinese: '门', pinyin: 'mén', english: 'door', difficulty: 1, category: '建筑' },
                    { chinese: '饭碗', pinyin: 'fàn wǎn', english: 'bowl', difficulty: 1, category: '用品' },
                    { chinese: '筷子', pinyin: 'kuài zi', english: 'chopsticks', difficulty: 1, category: '用品' },
                    { chinese: '杯子', pinyin: 'bēi zi', english: 'cup', difficulty: 1, category: '用品' },
                    { chinese: '台灯', pinyin: 'tái dēng', english: 'desk lamp', difficulty: 1, category: '用品' },
                    { chinese: '时钟', pinyin: 'shí zhōng', english: 'clock', difficulty: 1, category: '用品' }
                ]
            },
            '小学2年级': {
                '超市': [
                    { chinese: '收银台', pinyin: 'shōu yín tái', english: 'checkout counter', difficulty: 2, category: '设施' },
                    { chinese: '促销', pinyin: 'cù xiāo', english: 'promotion', difficulty: 2, category: '活动' },
                    { chinese: '会员卡', pinyin: 'huì yuán kǎ', english: 'membership card', difficulty: 2, category: '物品' },
                    { chinese: '购物袋', pinyin: 'gòu wù dài', english: 'shopping bag', difficulty: 2, category: '用品' },
                    { chinese: '标签', pinyin: 'biāo qiān', english: 'label', difficulty: 2, category: '标识' },
                    { chinese: '冷藏柜', pinyin: 'lěng cáng guì', english: 'refrigerator', difficulty: 2, category: '设施' },
                    { chinese: '化妆品', pinyin: 'huà zhuāng pǐn', english: 'cosmetics', difficulty: 2, category: '商品' },
                    { chinese: '日用品', pinyin: 'rì yòng pǐn', english: 'daily necessities', difficulty: 2, category: '商品' },
                    { chinese: '零食', pinyin: 'líng shí', english: 'snacks', difficulty: 2, category: '食品' },
                    { chinese: '肉类', pinyin: 'ròu lèi', english: 'meat', difficulty: 2, category: '食品' },
                    { chinese: '海鲜', pinyin: 'hǎi xiān', english: 'seafood', difficulty: 2, category: '食品' },
                    { chinese: '调料', pinyin: 'tiáo liào', english: 'seasoning', difficulty: 2, category: '食品' },
                    { chinese: '油', pinyin: 'yóu', english: 'oil', difficulty: 2, category: '食品' },
                    { chinese: '盐', pinyin: 'yán', english: 'salt', difficulty: 2, category: '食品' },
                    { chinese: '糖', pinyin: 'táng', english: 'sugar', difficulty: 2, category: '食品' }
                ],
                '医院': [
                    { chinese: '医生', pinyin: 'yī shēng', english: 'doctor', difficulty: 2, category: '职业' },
                    { chinese: '护士', pinyin: 'hù shì', english: 'nurse', difficulty: 2, category: '职业' },
                    { chinese: '病人', pinyin: 'bìng rén', english: 'patient', difficulty: 2, category: '身份' },
                    { chinese: '药', pinyin: 'yào', english: 'medicine', difficulty: 2, category: '物品' },
                    { chinese: '体温计', pinyin: 'tǐ wēn jì', english: 'thermometer', difficulty: 2, category: '用品' },
                    { chinese: '口罩', pinyin: 'kǒu zhào', english: 'mask', difficulty: 2, category: '用品' },
                    { chinese: '听诊器', pinyin: 'tīng zhěn qì', english: 'stethoscope', difficulty: 2, category: '器械' },
                    { chinese: '注射器', pinyin: 'zhù shè qì', english: 'syringe', difficulty: 2, category: '器械' },
                    { chinese: '病床', pinyin: 'bìng chuáng', english: 'hospital bed', difficulty: 2, category: '设施' },
                    { chinese: '挂号', pinyin: 'guà hào', english: 'registration', difficulty: 2, category: '流程' },
                    { chinese: '药房', pinyin: 'yào fáng', english: 'pharmacy', difficulty: 2, category: '场所' },
                    { chinese: '急诊', pinyin: 'jí zhěn', english: 'emergency', difficulty: 2, category: '部门' },
                    { chinese: '手术', pinyin: 'shǒu shù', english: 'surgery', difficulty: 2, category: '治疗' },
                    { chinese: '检查', pinyin: 'jiǎn chá', english: 'check-up', difficulty: 2, category: '流程' },
                    { chinese: '康复', pinyin: 'kāng fù', english: 'recovery', difficulty: 2, category: '状态' }
                ]
            },
            '小学3年级': {
                '动物园': [
                    { chinese: '狮子', pinyin: 'shī zi', english: 'lion', difficulty: 3, category: '动物' },
                    { chinese: '老虎', pinyin: 'lǎo hǔ', english: 'tiger', difficulty: 3, category: '动物' },
                    { chinese: '大象', pinyin: 'dà xiàng', english: 'elephant', difficulty: 3, category: '动物' },
                    { chinese: '猴子', pinyin: 'hóu zi', english: 'monkey', difficulty: 3, category: '动物' },
                    { chinese: '熊猫', pinyin: 'xióng māo', english: 'panda', difficulty: 3, category: '动物' },
                    { chinese: '长颈鹿', pinyin: 'cháng jǐng lù', english: 'giraffe', difficulty: 3, category: '动物' },
                    { chinese: '斑马', pinyin: 'bān mǎ', english: 'zebra', difficulty: 3, category: '动物' },
                    { chinese: '袋鼠', pinyin: 'dài shǔ', english: 'kangaroo', difficulty: 3, category: '动物' },
                    { chinese: '企鹅', pinyin: 'qǐ é', english: 'penguin', difficulty: 3, category: '动物' },
                    { chinese: '海豚', pinyin: 'hǎi tún', english: 'dolphin', difficulty: 3, category: '动物' },
                    { chinese: '笼子', pinyin: 'lóng zi', english: 'cage', difficulty: 3, category: '设施' },
                    { chinese: '围栏', pinyin: 'wéi lán', english: 'fence', difficulty: 3, category: '设施' },
                    { chinese: '饲养员', pinyin: 'sì yǎng yuán', english: 'keeper', difficulty: 3, category: '职业' },
                    { chinese: '表演', pinyin: 'biǎo yǎn', english: 'show', difficulty: 3, category: '活动' },
                    { chinese: '门票', pinyin: 'mén piào', english: 'ticket', difficulty: 3, category: '物品' }
                ],
                '交通': [
                    { chinese: '汽车', pinyin: 'qì chē', english: 'car', difficulty: 3, category: '交通工具' },
                    { chinese: '公交车', pinyin: 'gōng jiāo chē', english: 'bus', difficulty: 3, category: '交通工具' },
                    { chinese: '地铁', pinyin: 'dì tiě', english: 'subway', difficulty: 3, category: '交通工具' },
                    { chinese: '火车', pinyin: 'huǒ chē', english: 'train', difficulty: 3, category: '交通工具' },
                    { chinese: '飞机', pinyin: 'fēi jī', english: 'airplane', difficulty: 3, category: '交通工具' },
                    { chinese: '轮船', pinyin: 'lún chuán', english: 'ship', difficulty: 3, category: '交通工具' },
                    { chinese: '自行车', pinyin: 'zì xíng chē', english: 'bicycle', difficulty: 3, category: '交通工具' },
                    { chinese: '红绿灯', pinyin: 'hóng lǜ dēng', english: 'traffic light', difficulty: 3, category: '设施' },
                    { chinese: '斑马线', pinyin: 'bān mǎ xiàn', english: 'zebra crossing', difficulty: 3, category: '设施' },
                    { chinese: '站台', pinyin: 'zhàn tái', english: 'platform', difficulty: 3, category: '设施' },
                    { chinese: '候车室', pinyin: 'hòu chē shì', english: 'waiting room', difficulty: 3, category: '设施' },
                    { chinese: '售票处', pinyin: 'shòu piào chù', english: 'ticket office', difficulty: 3, category: '设施' },
                    { chinese: '司机', pinyin: 'sī jī', english: 'driver', difficulty: 3, category: '职业' },
                    { chinese: '乘客', pinyin: 'chéng kè', english: 'passenger', difficulty: 3, category: '身份' },
                    { chinese: '安全带', pinyin: 'ān quán dài', english: 'seat belt', difficulty: 3, category: '设施' }
                ]
            },
            // 可以继续添加更多年级和主题的词汇
        };
    }

    /**
     * 根据年级和主题获取词汇
     * @param {string} grade - 年级
     * @param {string} topic - 主题
     * @param {number} count - 需要的词汇数量
     * @returns {Array} 词汇列表
     */
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

    /**
     * 从相邻年级补充词汇
     * @param {string} grade - 年级
     * @param {string} topic - 主题
     * @param {number} targetCount - 目标数量
     * @returns {Array} 词汇列表
     */
    supplementVocabulary(grade, topic, targetCount) {
        let allVocab = [];
        const gradeIndex = this.gradeList.indexOf(grade);

        // 获取当前年级的词汇
        const currentVocab = this.vocabularyDB[grade]?.[topic] || [];
        allVocab = allVocab.concat(currentVocab);

        // 从相邻年级获取词汇
        if (gradeIndex > 0) {
            const prevGrade = this.gradeList[gradeIndex - 1];
            const prevVocab = this.vocabularyDB[prevGrade]?.[topic] || [];
            allVocab = allVocab.concat(prevVocab);
        }

        if (gradeIndex < this.gradeList.length - 1) {
            const nextGrade = this.gradeList[gradeIndex + 1];
            const nextVocab = this.vocabularyDB[nextGrade]?.[topic] || [];
            allVocab = allVocab.concat(nextVocab);
        }

        // 从所有年级获取该主题词汇
        for (const g of this.gradeList) {
            if (g !== grade && !allVocab.some(v => v.chinese === g)) {
                const vocab = this.vocabularyDB[g]?.[topic] || [];
                allVocab = allVocab.concat(vocab);
            }
        }

        // 去重并随机选择
        const uniqueVocab = allVocab.filter((word, index, self) =>
            index === self.findIndex(w => w.chinese === word.chinese)
        );

        return this.shuffleArray(uniqueVocab).slice(0, targetCount);
    }

    /**
     * 随机打乱数组
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

    /**
     * 添加自定义词汇
     * @param {string} grade - 年级
     * @param {string} topic - 主题
     * @param {Object} word - 词汇对象
     */
    addVocabulary(grade, topic, word) {
        if (!this.vocabularyDB[grade]) {
            this.vocabularyDB[grade] = {};
        }
        if (!this.vocabularyDB[grade][topic]) {
            this.vocabularyDB[grade][topic] = [];
        }

        // 检查是否已存在
        const exists = this.vocabularyDB[grade][topic].some(
            w => w.chinese === word.chinese
        );

        if (!exists) {
            this.vocabularyDB[grade][topic].push({
                ...word,
                difficulty: word.difficulty || this.getDifficultyFromGrade(grade)
            });
            this.saveVocabulary();
        }
    }

    /**
     * 删除词汇
     * @param {string} grade - 年级
     * @param {string} topic - 主题
     * @param {string} chinese - 中文词汇
     */
    removeVocabulary(grade, topic, chinese) {
        if (this.vocabularyDB[grade]?.[topic]) {
            this.vocabularyDB[grade][topic] = this.vocabularyDB[grade][topic].filter(
                word => word.chinese !== chinese
            );
            this.saveVocabulary();
        }
    }

    /**
     * 保存词汇库到localStorage
     */
    saveVocabulary() {
        try {
            localStorage.setItem('vocabulary_db', JSON.stringify(this.vocabularyDB));
        } catch (error) {
            console.error('保存词汇库失败:', error);
        }
    }

    /**
     * 根据年级获取难度等级
     * @param {string} grade - 年级
     * @returns {number} 难度等级
     */
    getDifficultyFromGrade(grade) {
        const match = grade.match(/(\d+)年级/);
        if (match) {
            const num = parseInt(match[1]);
            if (grade.includes('小学')) {
                return num;
            } else if (grade.includes('初中')) {
                return 6 + num;
            }
        }
        return 1;
    }

    /**
     * 获取所有主题列表
     * @returns {Array} 主题列表
     */
    getTopics() {
        return [...this.topics];
    }

    /**
     * 获取所有年级列表
     * @returns {Array} 年级列表
     */
    getGrades() {
        return [...this.gradeList];
    }

    /**
     * 获取指定年级的所有主题
     * @param {string} grade - 年级
     * @returns {Array} 主题列表
     */
    getTopicsByGrade(grade) {
        const gradeVocab = this.vocabularyDB[grade] || {};
        return Object.keys(gradeVocab);
    }

    /**
     * 检查词汇是否存在
     * @param {string} grade - 年级
     * @param {string} topic - 主题
     * @param {string} chinese - 中文词汇
     * @returns {boolean} 是否存在
     */
    hasVocabulary(grade, topic, chinese) {
        return this.vocabularyDB[grade]?.[topic]?.some(
            word => word.chinese === chinese
        ) || false;
    }

    /**
     * 获取词汇统计信息
     * @returns {Object} 统计信息
     */
    getVocabularyStats() {
        const stats = {
            totalWords: 0,
            byGrade: {},
            byTopic: {},
            byCategory: {}
        };

        for (const grade of this.gradeList) {
            const gradeVocab = this.vocabularyDB[grade] || {};
            let gradeCount = 0;
            stats.byGrade[grade] = {};

            for (const topic of Object.keys(gradeVocab)) {
                const words = gradeVocab[topic];
                const topicCount = words.length;
                gradeCount += topicCount;

                stats.byGrade[grade][topic] = topicCount;
                stats.byTopic[topic] = (stats.byTopic[topic] || 0) + topicCount;

                words.forEach(word => {
                    stats.totalWords++;
                    if (word.category) {
                        stats.byCategory[word.category] = (stats.byCategory[word.category] || 0) + 1;
                    }
                });
            }
        }

        return stats;
    }
}