# 儿童识字卡片生成器 - 重构说明

## 重构完成

应用已成功重构为非模块化版本，现在可以直接双击 `index.html` 文件使用。

## 重构内容

### 1. 文件变更
- **新增**: `script.js` - 整合了所有JavaScript功能的单一文件
- **修改**: `index.html` - 移除了 `type="module"` 属性，改为引用 `script.js`
- **保留**: 原有的 `js/` 文件夹中的所有文件（作为备份）

### 2. 代码整合
将以下文件全部整合到 `script.js` 中：
- `js/config.js` - 配置和工具函数
- `js/services/api.js` - API服务类
- `js/services/storage.js` - 本地存储服务
- `js/services/vocabularyManager.js` - 词汇管理器
- `js/services/enhancedPromptBuilder.js` - 提示词构建器
- `js/modules/cardGeneration.js` - 卡片生成器
- `js/modules/polling.js` - 轮询管理器
- `js/modules/ui.js` - UI管理器
- `js/main.js` - 主入口代码

### 3. 主要改动
- 移除了所有 `export` 和 `import` 语句
- 将类和函数转换为全局可访问
- 使用 `window.ZhishiApp` 命名空间组织代码
- 保持了所有原有功能不变
- 确保 `ui` 全局变量可用（供HTML中的onclick调用）

## 使用方法

1. **直接使用**：双击 `index.html` 文件即可在浏览器中打开应用
2. **本地服务器**：如需通过本地服务器访问，可以使用任何HTTP服务器（如 `Live Server` 插件）
3. **配置API密钥**：在 `script.js` 文件中的 `CONFIG.API.KEY` 处配置您的API密钥

## 功能特性

重构后的应用保留了所有原有功能：
- 智能分级词汇生成
- 多主题选择（超市、医院、公园、学校、家庭、动物园、交通）
- 多种标注格式（拼音、英文、或两者都有）
- 本地历史记录保存
- 卡片预览、下载和分享
- 响应式设计，支持移动设备

## 注意事项

1. 确保 `script.js` 和 `index.html` 在同一目录下
2. 如需修改API密钥，请编辑 `script.js` 文件中的配置部分
3. 原有的 `js/` 文件夹已保留，可以作为参考或备份
4. 应用仍需要有效的API密钥才能生成卡片

## 故障排除

如果遇到问题：
1. 检查浏览器控制台是否有错误信息
2. 确认 `script.js` 文件路径正确
3. 验证API密钥是否已正确配置
4. 尝试使用最新版本的Chrome、Firefox、Safari或Edge浏览器