# Changelog

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
