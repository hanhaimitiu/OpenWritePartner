# Open Write Partner

一个为小说创作者设计的VSCode插件，利用AI进行文本润色、审稿和改写。

## 功能特性

- **AI润色** - 对选中的小说文本进行润色优化，增强语言表达和可读性
- **AI审稿** - 对文本进行全面审查，提供详细的修改建议
- **AI改写** - 根据用户输入的要求对文本进行改写（如改变风格、语气等）
- **右键菜单** - 选中文本后右键即可使用润色、审稿或改写功能
- **可配置提示词** - 用户可自定义AI润色、审稿和改写的系统提示词

## 安装方法

### 方法一：从VSIX安装

1. 下载或生成 `.vsix` 文件
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
3. **方式一**：右键选中的文本，选择「AI润色」、「AI审稿」或「AI改写」
4. **方式二**：按 `Ctrl+Shift+P` 打开命令面板，搜索「AI润色」、「AI审稿」或「AI改写」

### AI改写功能

选择「AI改写」后，会弹出输入框让你输入改写要求，例如：
- 将这段文字改写成古风风格
- 让语气更激昂
- 改成幽默搞笑的风格
- 翻译成文言文

## 配置

在VSCode设置中搜索「Open Write Partner」进行配置：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `apiUrl` | AI API的URL地址 | `http://localhost:8080` |
| `apiKey` | API密钥 | `123` |
| `model` | 使用的AI模型 | `gpt-3.5-turbo` |
| `polishPrompt` | AI润色功能的系统提示词 | 文学编辑风格提示词 |
| `reviewPrompt` | AI审稿功能的系统提示词 | 文学编辑风格提示词 |
| `rewritePrompt` | AI改写功能的系统提示词 | 文学编辑风格提示词（{instruction} 会被替换为用户输入的改写要求） |
| `contextLength` | 续写时使用的上下文长度（字符数） | `2000` |
| `temperature` | AI生成时的温度参数，值越高越随机（0-2） | `0.7` |

## 技术栈

- TypeScript
- VSCode Extension API
- Node.js

## 开发指南

### 环境要求

- Node.js >= 16.x
- npm >= 8.x
- VSCode >= 1.80.0

### 安装依赖

```bash
cd open_write_partner
npm install
```

### 编译代码

```bash
# 编译一次
npm run compile

# 监听模式（开发时使用）
npm run watch
```

### 启动调试

1. 打开项目文件夹
2. 按 `F5` 键启动调试
3. 会打开一个新的VSCode窗口（扩展开发宿主）
4. 在新窗口中测试插件功能

### 打包VSIX

```bash
# 方法一：使用项目内的vsce
.\node_modules\.bin\vsce.cmd package

# 方法二：使用全局安装的vsce（需要先安装）
# npm install -g @vscode/vsce
# vsce package
```

打包成功后，会在项目目录下生成类似 `open-write-partner-1.0.0.vsix` 的文件。

### 发布到市场（可选）

```bash
# 登录（首次需要）
vsce login <publisher-name>

# 发布
vsce publish
```

## 常见问题

### 1. PowerShell执行策略限制

如果遇到 `ExecutionPolicy` 错误，可以尝试：

```powershell
# 查看当前执行策略
Get-ExecutionPolicy

# 设置执行策略（需要管理员权限）
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 打包时缺少 LICENSE 文件

如果打包时提示缺少 LICENSE 文件，可以创建一个：

```bash
echo "MIT License" > LICENSE
```

### 3. 插件无法激活

请确保：
- AI服务已在配置的 `apiUrl` 地址运行
- API密钥正确配置
- VSCode版本 >= 1.80.0

### 4. 编译错误

```bash
# 清理并重新编译
rm -rf out/
npm run compile
```

## 项目结构

```
open_write_partner/
├── .git/                    # Git仓库
├── .gitignore               # Git忽略配置
├── README.md                # 项目说明文档
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript配置
├── src/
│   ├── aiService.ts         # AI服务模块
│   ├── commands.ts          # 命令处理函数
│   └── extension.ts         # 扩展入口
└── node_modules/            # 依赖包
```

## 许可证

MIT