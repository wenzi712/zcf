# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发命令

```bash
# 开发模式运行
pnpm dev

# 构建项目
pnpm build

# 类型检查
pnpm typecheck

# 本地测试构建结果
pnpm test
```

## 项目架构

这是一个 Claude Code 零配置工具 (ZCF - Zero-Config Claude-Code Flow)，用于自动化配置 Claude Code 的工作环境。

### 核心组件

1. **CLI 入口** (`src/cli.ts`)：使用 cac 构建的命令行界面，处理用户交互和命令解析

2. **初始化流程** (`src/commands/init.ts`)：九步配置流程
   - 选择脚本语言（中文/英文）
   - 选择配置语言（决定复制哪套模板）
   - 检测并安装 Claude Code
   - 处理现有配置（备份/合并/跳过）
   - 配置 API（自定义/跳过）
   - 复制配置文件
   - 配置 MCP 服务（自动配置，支持多选）
   - 处理需要 API Key 的服务
   - 生成并保存 ~/.claude.json

3. **工具函数**
   - `utils/installer.ts`：Claude Code 安装检测和自动安装
   - `utils/config.ts`：配置文件管理（备份、复制、合并）
   - `utils/platform.ts`：跨平台路径处理
   - `utils/mcp.ts`：MCP 配置管理（读取、写入、合并、备份）

4. **模板系统** (`templates/`)：优化的配置结构
   - `settings.json`：基础配置（含隐私保护环境变量）
   - `en/` 和 `zh-CN/`：语言特定配置
     - `CLAUDE.md`：系统指令和原则
     - `agents/`：AI 代理定义（planner、ui-ux-designer）
     - `commands/`：自定义命令（feat、workflow）

### 构建配置

使用 unbuild 构建工具，配置在 `build.config.ts`：
- 入口：src/index 和 src/cli
- 输出：ESM 格式到 dist/
- 内联所有依赖

### 发布流程

作为 npm 包 `zcf`，支持 npx 直接执行：
- bin 入口：`bin/zcf.mjs`
- 发布文件：dist、bin、templates

## 代码规范

- TypeScript 严格模式
- ESM 模块系统
- 使用 prompts 处理交互
- 使用 ansis 处理终端颜色
- 路径处理使用 pathe 确保跨平台兼容