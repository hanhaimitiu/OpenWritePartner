# Open Write Partner

一个为小说创作者设计的VSCode插件，利用AI进行文本润色和续写。

## 功能特性

- **AI润色** - 对选中的小说文本进行润色优化，增强语言表达和可读性
- **AI续写** - 根据现有文本上下文继续创作后续内容
- **右键菜单** - 选中文本后右键即可使用润色或续写功能
- **可配置提示词** - 用户可自定义AI润色和续写的系统提示词

## 安装方法

### 方法一：从VSIX安装

1. 下载 `.vsix` 文件
2. 在VSCode中按 `Ctrl+Shift+X` 打开扩展面板
3. 点击右上角「...」菜单 → 选择「从VSIX安装」
4. 选择下载的 `.vsix` 文件

### 方法二：开发模式运行

```bash
npm install
npm run compile
# 按F5启动调试
```

## 使用方法

1. 打开任意文本文件（.txt、.md等）
2. 选中要处理的文本
3. **方式一**：右键选中的文本，选择「AI润色」或「AI续写」
4. **方式二**：按 `Ctrl+Shift+P` 打开命令面板，搜索「AI润色」或「AI续写」

## 配置

在VSCode设置中搜索「Open Write Partner」进行配置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `apiUrl` | AI API的URL地址 | `http://localhost:8080` |
| `apiKey` | API密钥 | `123` |
| `model` | 使用的AI模型 | `gpt-3.5-turbo` |
| `polishPrompt` | AI润色功能的系统提示词 | 文学编辑风格提示词 |
| `continuePrompt` | AI续写功能的系统提示词 | 小说家风格提示词 |

## 技术栈

- TypeScript
- VSCode Extension API
- Node.js

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 启动调试（F5）
```

## 打包

```bash
# 生成VSIX文件
vsce package
```

## 许可证

MIT