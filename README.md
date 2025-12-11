# 知识卡片 - 儿童识字小报生成器

使用Nano Banana Pro AI模型生成儿童识字卡片的Web应用。

## 功能特点

- 🎓 **智能分级**：支持小学1-6年级和初中1-3年级，自动匹配合适难度的词汇
- 🌏 **多语言标注**：支持拼音、英文单词或两者同时显示
- 🎨 **丰富主题**：涵盖超市、医院、公园、学校、家庭、动物园、交通等生活场景
- 📱 **响应式设计**：适配桌面和移动设备
- 💾 **本地存储**：自动保存生成历史，支持搜索和管理
- 🔄 **实时生成**：实时查看生成进度，支持取消操作

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (ES6+)
- **API**：Nano Banana Pro AI模型
- **存储**：LocalStorage
- **模块化**：ES6 Modules

## 快速开始

### 1. 配置API密钥

在 `js/config.js` 文件中配置您的API密钥：

```javascript
export const CONFIG = {
    API: {
        KEY: 'YOUR_API_KEY_HERE', // 替换为您的实际API密钥
        // ...
    }
};
```

您可以从 [https://kie.ai/api-key](https://kie.ai/api-key) 获取API密钥。

### 2. 运行项目

由于使用了ES6模块，需要通过HTTP服务器运行。您可以使用以下任一方法：

#### 方法一：使用Python（推荐）

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 方法二：使用Node.js

```bash
# 安装http-server
npm install -g http-server

# 运行
http-server -p 8000
```

#### 方法三：使用VS Code Live Server插件

1. 在VS Code中安装 "Live Server" 插件
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

### 3. 访问应用

打开浏览器访问：`http://localhost:8000`

## 使用说明

### 生成卡片

1. **选择学习阶段**：小学或初中
2. **选择年级**：根据孩子实际年级选择
3. **选择主题**：选择想要学习的场景主题
4. **输入标题**：为卡片起一个有意义的标题
5. **选择标注格式**：
   - 拼音 + 汉字
   - 英文 + 汉字
   - 拼音 + 英文 + 汉字
6. **设置参数**：选择图片比例和分辨率
7. **点击生成**：等待AI生成卡片

### 查看历史

- 点击导航栏的"历史记录"
- 可以搜索、预览、下载或删除历史卡片
- 支持按标题、主题、年级搜索

## 项目结构

```
zhishi card-1211/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── styles.css          # 全局样式
│   └── components/         # 组件样式
│       ├── generator.css   # 生成器样式
│       ├── history.css     # 历史记录样式
│       └── card.css        # 卡片样式
├── js/                     # JavaScript文件
│   ├── main.js             # 主入口
│   ├── config.js           # 配置文件
│   ├── services/           # 服务模块
│   │   ├── api.js          # API服务
│   │   ├── storage.js      # 存储服务
│   │   ├── vocabularyManager.js  # 词汇管理
│   │   └── enhancedPromptBuilder.js  # 提示词构建
│   └── modules/            # 功能模块
│       ├── cardGeneration.js    # 卡片生成
│       ├── polling.js           # 轮询管理
│       └── ui.js                # UI管理
└── README.md               # 说明文档
```

## API文档

### 创建任务

```http
POST https://api.kie.ai/api/v1/jobs/createTask
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "nano-banana-pro",
  "input": {
    "prompt": "您的提示词",
    "aspect_ratio": "3:4",
    "resolution": "1K",
    "output_format": "png"
  }
}
```

### 查询任务

```http
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=TASK_ID
Authorization: Bearer YOUR_API_KEY
```

## 自定义词汇

您可以扩展词汇库来支持更多主题和词汇：

```javascript
// 在 vocabularyManager.js 中添加
'小学1年级': {
    '新主题': [
        { chinese: '新词', pinyin: 'xīn cí', english: 'new word', difficulty: 1, category: '分类' }
    ]
}
```

## 浏览器兼容性

- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## 常见问题

### Q: 提示"API密钥无效"怎么办？
A: 请检查配置文件中的API密钥是否正确，或访问 https://kie.ai/api-key 重新获取。

### Q: 生成很慢怎么办？
A: AI生成需要时间，通常在10-30秒之间。如果超过5分钟还未完成，建议取消后重试。

### Q: 图片无法加载？
A: 可能是网络问题或图片URL已过期。尝试重新生成或下载保存。

### Q: 支持批量生成吗？
A: 目前需要逐张生成，但历史记录会自动保存，方便管理。

## 开发说明

### 调试模式

在 `js/config.js` 中设置：

```javascript
export const CONFIG = {
    DEBUG: {
        ENABLED: true,
        LOG_LEVEL: 'debug'
    }
};
```

### 添加新主题

1. 在 `vocabularyManager.js` 的 `topics` 数组中添加新主题
2. 在各年级词汇中添加对应的词汇列表
3. 在 `index.html` 的主题选择器中添加选项

### 自定义样式

所有样式都使用CSS变量定义，可以在 `css/styles.css` 中修改：

```css
:root {
    --primary-color: #4CAF50;
    --primary-hover: #45a049;
    /* 其他变量... */
}
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。