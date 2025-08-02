# Claude Code 配置

**中文** | [English](README_EN.md)

> 专业的 AI 编程助手配置框架，提供结构化工作流和智能代理系统

## 🚀 快速开始

1. **复制配置文件**

   选择复制中文或英文配置（英文版 token 消耗更低，中文版便于中文用户自定义）：

   ```bash
   # 创建配置目录
   mkdir -p ~/.claude

   # 选择一种语言配置复制：
   # 英文版（推荐，token 消耗更低）
   cp -r en/* ~/.claude/

   # 或者中文版（便于中文用户自定义）
   cp -r zh-CN/* ~/.claude/
   ```

2. **配置 API 密钥**

   编辑 ~/.claude/settings.json

   ```json
   {
     "env": {
       "ANTHROPIC_API_KEY": "your-api-key-here"
     }
   }
   ```

3. **配置 MCP 服务（可选但推荐）**

   编辑 `~/.claude.json` 添加 MCP 服务：

   ```json
   {
     "mcpServers": {
       "figma": {
         "type": "sse",
         "url": "http://127.0.0.1:3845/sse"
       },
       "context7": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp"],
         "env": {}
       },
       "filesystem": {
         "type": "stdio",
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-filesystem",
           "/Users/username/Desktop",
           "/path/to/other/allowed/dir"
         ],
         "env": {}
       },
       "mcp-deepwiki": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "mcp-deepwiki@latest"],
         "env": {}
       },
       "fetch": {
         "type": "stdio",
         "command": "uvx",
         "args": ["mcp-server-fetch"],
         "env": {
           "PYTHONIOENCODING": "utf-8"
         }
       },
       "Playwright": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "@playwright/mcp@latest"],
         "env": {}
       },
       "exa": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://mcp.exa.ai/mcp?exaApiKey=your-api-key-here"],
         "env": {}
       }
     }
   }
   ```

   **MCP 配置说明：**

   - **Figma**：需要本地 Figma 应用开启 MCP Server，[官方文档](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
   - **Filesystem**：需要配置允许访问的本地路径，替换示例中的路径为你的实际路径
   - **Exa**：需要填写你的 API Key，[获取地址](https://dashboard.exa.ai/api-keys)

4. **开始使用**
   - `<任务描述>` - 不使用任何工作流直接执行，会遵循 SOLID、KISS、DRY 和 YAGNI 原则，适合修复 Bug 等小任务
   - `/feat <任务描述>` - 开始新功能开发，分为 plan 和 ui 两个阶段
   - `/workflow <任务描述>` - 执行完整开发工作流

## 📁 项目结构

```
claude-code-config/
├── README.md              # 说明文档
├── settings.json          # 主配置文件
├── en/                    # 英文版
│   ├── CLAUDE.md          # 核心原则
│   ├── agents/            # AI 代理
│   │   ├── planner.md     # 任务规划代理
│   │   └── ui-ux-designer.md  # UI/UX 设计代理
│   └── commands/          # 命令定义
│       ├── feat.md        # 功能开发
│       └── workflow.md    # 工作流命令
└── zh-CN/                 # 中文版
    └── ... (相同结构)
```

## ✨ 核心特性

### 🤖 专业代理

- **任务规划师**：将复杂任务拆解为可执行步骤
- **UI/UX 设计师**：提供专业界面设计指导

### ⚡ 命令系统

- **功能开发** (`/feat`)：结构化新功能开发
- **工作流** (`/workflow`)：完整的六阶段开发流程

### 🔧 智能配置

- API 密钥管理
- 细粒度权限控制
- 多种 Claude 模型支持

## 🎯 开发工作流

### 六阶段工作流

1. **[模式：研究]** - 理解需求
2. **[模式：构思]** - 设计方案
3. **[模式：计划]** - 制定详细计划
4. **[模式：执行]** - 实施开发
5. **[模式：优化]** - 提升质量
6. **[模式：评审]** - 最终评估

## ⚙️ 配置说明

### 基础配置

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
  },
  "model": "opus",  // opus 或 sonnet
  "permissions": {
    "allow": ["Bash(*)", "Read(*)", "Write(*)", ...]
  }
}
```

### 模型选择

- **opus**：最强大，适合复杂任务
- **sonnet**：平衡性能和成本
- **haiku**：快速轻量级模型

## 💡 最佳实践

1. **任务分解**：保持任务独立可测试
2. **代码质量**：遵循 SOLID、KISS、DRY 和 YAGNI 原则
3. **文档管理**：计划存储在 `.claude/` 目录

## 🔧 故障排除

### 常见问题

**API 连接错误**

```bash
# 检查 API 密钥
echo $ANTHROPIC_API_KEY

# 验证配置
cat ~/.claude/settings.json | jq '.env'
```

**权限被拒绝**

```json
// 在 settings.json 中添加所需权限
{
  "permissions": {
    "allow": ["Bash(*)", "Write(*)"]
  }
}
```

## 🙏 鸣谢

本项目的部分 Prompt 参考了以下优秀作品：

- [Linux.do - 分享一个让 AI 只生成必要的代码的通用 Prompt，欢迎一起调优~](https://linux.do/t/topic/830802)
- [Linux.do - claude code 降智不怕，使用 agent 与 command 结合将任务做详细的拆分大概可以帮助到你](https://linux.do/t/topic/815230)
- [Linux.do - cursor 快速开发规则](https://linux.do/t/topic/697566)

感谢这些社区贡献者的分享！

## 📄 许可证

MIT 许可证

---

如果这个项目对你有帮助，请给我一个 ⭐️ Star！
