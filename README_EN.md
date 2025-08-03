# Claude Code Configuration

[中文](README.md) | **English**

> Professional AI programming assistant configuration framework with structured workflows and intelligent agent system

## 🚀 Quick Start

1. **Copy configuration files**

   ```bash
   # Create configuration directory
   mkdir -p ~/.claude

   # Copy English configuration files
   cp -r en/* ~/.claude/
   ```

2. **Configure API key**

   Edit ~/.claude/settings.json

   ```json
   {
     "env": {
       "ANTHROPIC_API_KEY": "your-api-key-here"
     }
   }
   ```

3. **Configure MCP Services (Optional but Recommended)**

   Edit `~/.claude.json` to add MCP services:

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
       "mcp-deepwiki": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "mcp-deepwiki@latest"],
         "env": {}
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

   **MCP Configuration Notes:**

   - **Figma**: Requires local Figma app with MCP Server enabled, [Official Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
   - **Exa**: Requires your API Key, [Get API Key](https://dashboard.exa.ai/api-keys)

4. **Start using**

   - **For first-time project use, it's highly recommended to run `/init` to generate a CLAUDE.md summary for better AI understanding of project architecture**
   - `<task description>` - Execute directly without any workflow, adhering to SOLID, KISS, DRY, and YAGNI principles; suitable for small tasks like bug fixes
   - `/feat <task description>` - Start developing new features, divided into two phases: plan and UI
   - `/workflow <task description>` - Run complete development workflow, not fully automated; starts with multiple solution options, asks for user feedback at each step, allows modifying plans, and provides maximum control

   > **PS**:
   >
   > - Both feat and workflow have their advantages, try both to compare
   > - Generated documents are located by default at `.claude/xxx.md` in the project root, you can add `.claude/` to your project's `.gitignore`

## 📁 Project Structure

```
claude-code-config/
├── README.md              # Documentation
├── settings.json          # Main configuration
├── en/                    # English version
│   ├── CLAUDE.md          # Core principles
│   ├── agents/            # AI agents
│   │   ├── planner.md     # Task planning agent
│   │   └── ui-ux-designer.md  # UI/UX design agent
│   └── commands/          # Commands
│       ├── feat.md        # Feature development
│       └── workflow.md    # Workflow command
└── zh-CN/                 # Chinese version
    └── ... (same structure)
```

## ✨ Core Features

### 🤖 Professional Agents

- **Task Planner**: Breaks down complex tasks into executable steps
- **UI/UX Designer**: Provides professional interface design guidance

### ⚡ Command System

- **Feature Development** (`/feat`): Structured new feature development
- **Workflow** (`/workflow`): Complete 6-phase development workflow

### 🔧 Smart Configuration

- API key management
- Fine-grained permission control
- Multiple Claude model support

## 🎯 Development Workflow

### Six-Phase Workflow

1. **[Mode: Research]** - Understand requirements
2. **[Mode: Ideate]** - Design solutions
3. **[Mode: Plan]** - Create detailed plan
4. **[Mode: Execute]** - Implement code
5. **[Mode: Optimize]** - Improve quality
6. **[Mode: Review]** - Final assessment

## ⚙️ Configuration

### Basic Settings

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
  },
  "model": "opus",  // opus or sonnet
  "permissions": {
    "allow": ["Bash(*)", "Read(*)", "Write(*)", ...]
  }
}
```

### Model Selection

- **opus**: Most powerful, for complex tasks
- **sonnet**: Balanced performance and cost
- **haiku**: Fast lightweight model

## 💡 Best Practices

1. **Task Breakdown**: Keep tasks independent and testable
2. **Code Quality**: Follow SOLID, KISS, DRY, and YAGNI principles
3. **Documentation**: Store plans in `.claude/` directory

## 🔧 Troubleshooting

### Common Issues

**API Connection Error**

```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Verify configuration
cat ~/.claude/settings.json | jq '.env'
```

**Permission Denied**

```json
// Add required permissions in settings.json
{
  "permissions": {
    "allow": ["Bash(*)", "Write(*)"]
  }
}
```

## 🙏 Acknowledgments

Some prompts in this project are inspired by the following excellent works:

- [Linux.do - 分享一个让 AI 只生成必要的代码的通用 Prompt，欢迎一起调优~](https://linux.do/t/topic/830802)
- [Linux.do - claude code 降智不怕，使用 agent 与 command 结合将任务做详细的拆分大概可以帮助到你](https://linux.do/t/topic/815230)
- [Linux.do - cursor 快速开发规则](https://linux.do/t/topic/697566)

Thanks to these community contributors for sharing!

## 📄 License

MIT License

---

If this project helps you, please give me a ⭐️ Star!

[![Star History Chart](https://api.star-history.com/svg?repos=UfoMiao/claude-code-config&type=Date)](https://star-history.com/#UfoMiao/claude-code-config&Date)
