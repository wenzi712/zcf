# Changelog

## 1.1.5

### Patch Changes

- refactor(config): 优化 settings 配置管理 / optimize settings configuration management

  - **消除重复配置 / Removed duplicate configuration**: 移除 `configureApi` 函数中的硬编码配置 / Eliminated hardcoded settings in `configureApi` function
  - **单一数据源 / Single source of truth**: 从模板 `settings.json` 读取默认配置 / Now reads default settings from template `settings.json`
  - **提升可维护性 / Improved maintainability**: 配置修改只需更新模板文件 / Configuration changes only need to be made in template file
  - **遵循 DRY 原则 / Following DRY principle**: 消除代码和模板间的配置重复 / Eliminated configuration duplication between code and templates

## 1.1.4

### Patch Changes

- feat: 增强 API 配置功能，支持选择 AUTH_TOKEN 或 API_KEY 认证方式

  - 用户现在可以选择使用 ANTHROPIC_AUTH_TOKEN（OAuth 认证）或 ANTHROPIC_API_KEY（密钥认证）
  - 每个认证选项都提供了清晰的描述说明
  - 根据用户选择设置正确的环境变量
  - 更新了中英文文档说明

## 1.1.3

### Patch Changes

- feat: 添加 AI 输出语言选择功能

  - 🌏 **新增 AI 输出语言选择**：用户可在初始化和更新时选择 AI 回复的语言

    - 支持多种预设语言（中文、英文等）
    - 支持自定义语言输入
    - 智能记忆用户偏好，避免重复询问

  - 🔧 **代码优化**：

    - 重构代码结构，提取公共方法到 `utils/prompts.ts`
    - 消除 init 和 update 命令中的重复代码
    - 优化 settings.json 配置结构，消除重复文件

  - 📝 **文档更新**：
    - 更新 README 文档，添加多语言支持说明
    - 移除模板中的硬编码语言指令

## 1.1.2

### Patch Changes

- ### 样式优化和文档改进

  - **样式**: 更新 banner 文本对齐方式，提升视觉一致性
  - **文档**:
    - 移除 README 文件中的支持模型章节
    - 添加项目截图到 README 和 README_EN
    - 更新文档管理路径说明，明确计划存储位置为项目根目录下的 `.claude/plan/` 目录
    - 优化 README 文档中的命令说明和格式

## 1.1.1

### Patch Changes

- d34c0a9: 优化文案和使用体验

  - 更新文案：将"仅更新 Prompt 文档"改为"仅更新工作流相关 md"，更准确地描述功能
  - 改进快速开始指南：清晰区分首次使用和已有环境两种场景
  - 添加双语帮助信息：CLI help 命令现在同时显示中英文说明
  - 优化用户引导：明确说明 `npx zcf` 用于完整初始化，`npx zcf u` 用于仅导入工作流

## 1.1.0

### Minor Changes

- feat: 添加 update 命令支持增量更新配置
  feat: 优化命令执行逻辑和错误处理
  feat: 改进用户体验和交互提示
  refactor: 重构配置管理模块
  docs: 更新 README 文档

## 1.0.3

### Patch Changes

- e9ba460: 修复 commandExists 函数逻辑错误

  - 修复了 commandExists 函数始终返回 true 的问题
  - 现在正确检查命令执行的 exitCode 来判断命令是否存在
  - 撤销了 1.0.2 版本中不必要的 Windows 特殊处理
  - 简化了安装流程，提升代码可维护性

## 1.0.2

### Patch Changes

- 2bf9394: 修复 Windows 安装后 PATH 未刷新问题

  - 添加 Windows 系统专属提示，提醒用户重新打开终端窗口
  - 优化安装验证逻辑，增加延迟检测
  - 改进安装流程追踪，仅在新安装时显示额外提醒

## 1.0.1

### Patch Changes

- 更新依赖, 增加自动发布流水线

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-08-03

### Features

- 初始版本发布
- 支持中英文双语配置
- 自动检测并安装 Claude Code
- 智能配置文件管理（备份、合并、跳过）
- MCP 服务自动配置
- 支持多种 MCP 服务：Context7、DeepWiki、Exa、Playwright 等
- 交互式命令行界面
- 跨平台支持（Windows、macOS、Linux）
