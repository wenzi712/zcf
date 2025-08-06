# Changelog

## 2.4.0

### Minor Changes

- ## 新功能

  - 添加环境变量和权限导入功能，支持从 settings.json 批量导入配置
  - 添加文档更新检查功能，任务完成后自动提醒更新相关文档
  - 更新技术执行指南，添加文档更新检查流程
  - 优化交互式菜单，支持配置环境变量和权限

  ## New Features

  - Add environment variables and permissions import feature, support bulk import from settings.json
  - Add documentation update check functionality, auto-remind to update docs after task completion
  - Update technical execution guidelines with documentation update check process
  - Enhance interactive menu with environment variables and permissions configuration

  ## 文档更新

  - 更新 README.md 和 README_EN.md，补充 v2.1-v2.3 版本特性说明
  - 更新 CLAUDE.md，添加完整的版本特性更新历史
  - 更新截图，反映最新的交互界面

  ## Documentation Updates

  - Update README.md and README_EN.md with v2.1-v2.3 version features
  - Update CLAUDE.md with complete version feature update history
  - Update screenshots to reflect latest interactive interface

## 2.3.0

### Minor Changes

- ## 新功能

  - 添加危险操作确认机制，提升 Claude Code 使用安全性
  - 优化技术执行指南文档，减少 token 消耗约 30%

  ## New Features

  - Add dangerous operations confirmation mechanism for improved Claude Code safety
  - Optimize technical execution guidelines documentation, reducing token consumption by ~30%

  ## 详细说明

  ### 危险操作确认

  需要用户确认的操作：

  - 文件系统：删除、批量修改、移动系统文件
  - 代码提交：git commit、push、reset --hard
  - 系统配置：环境变量、系统设置、权限变更
  - 数据操作：数据库删除、结构变更、批量更新
  - 网络请求：发送敏感数据、调用生产 API
  - 包管理：全局安装/卸载、更新核心依赖

  ### Details

  ### Dangerous Operations Confirmation

  Operations requiring user confirmation:

  - File System: Delete, bulk modifications, move system files
  - Code Commits: git commit, push, reset --hard
  - System Config: Environment variables, system settings, permissions
  - Data Operations: Database deletions, schema changes, bulk updates
  - Network Requests: Send sensitive data, call production APIs
  - Package Management: Global install/uninstall, update core dependencies

## 2.2.0

### Minor Changes

- ## 新功能

  - 添加技术执行指南文档，提供命令执行最佳实践
  - 新增 /zcf-release 自动化发版命令
  - 支持跨平台路径处理，自动为包含空格的路径添加引号
  - 优先使用 ripgrep 提升文件内容搜索性能

  ## New Features

  - Add technical execution guidelines with command best practices
  - Add /zcf-release automated release command
  - Support cross-platform path handling with automatic quotes for paths with spaces
  - Prioritize ripgrep for better file content search performance

  ## 文档更新

  - 新增中英文技术指南模板文件
  - 更新项目级 CLAUDE.md 模板

  ## Documentation Updates

  - Add technical guide template files in Chinese and English
  - Update project-level CLAUDE.md template

## 2.1.2

### Patch Changes

- ## 优化

  - 优化初始化流程，移除文档更新的特殊处理
  - 简化配置步骤，提升用户体验
  - 减少不必要的代码复杂度

  ## Optimization

  - Optimize initialization process and remove special handling for document updates
  - Simplify configuration steps to improve user experience
  - Reduce unnecessary code complexity

## 2.1.1

### Patch Changes

- 修复 npm 发布透明日志冲突问题

  Fix npm publish transparency log conflict issue

## 2.1.0

### Minor Changes

- faca88e: 新增 Termux 环境支持和增强的命令检测功能

  - 支持在 Termux 环境下运行 ZCF
  - 增强命令检测机制，自动识别可用命令

- 429794a: 修复中文模板文件的 description 字段使用中文描述

  - 将 workflow.md 的英文描述改为中文
  - 扩充 feat.md 的中文描述，使其更详细
  - 优化 workflow 命令的需求完整性评分机制

- 8b19bde: 修复 API 配置修改后无法返回菜单的问题

  - 修复部分修改功能执行后无法正确返回菜单
  - 改进菜单导航流程

- 22aa4cf: 替换 @posva/prompts 为 inquirer 解决 UI 渲染问题

  - 解决交互式界面渲染异常
  - 提升用户交互体验

---

- faca88e: Add Termux environment support with enhanced command detection

  - Support running ZCF in Termux environment
  - Enhanced command detection to automatically identify available commands

- 429794a: Fix Chinese template files description fields to use Chinese descriptions

  - Changed workflow.md description from English to Chinese
  - Enhanced feat.md Chinese description with more details
  - Optimized workflow command requirement scoring mechanism

- 8b19bde: Fixed the issue where some modification functions could not return to the menu

  - Fixed menu return issue after API configuration modifications
  - Improved menu navigation flow

- 22aa4cf: Replace @posva/prompts with inquirer to resolve UI rendering issues

  - Resolved interactive UI rendering anomalies
  - Enhanced user interaction experience

## 2.0.1

### Patch Changes

- 修复配置文件路径显示 undefined 的问题

  - 修复在更新配置时输出消息显示 "配置文件已复制到 undefined" 的问题
  - 现在会正确显示实际的配置目录路径（如 ~/.claude）

  Fixed undefined output in config file path display

  - Fixed issue where update command showed "Config files copied to undefined"
  - Now correctly displays the actual config directory path (e.g., ~/.claude)

## 2.0.0

### Major Changes

- ## ZCF 2.0.0 - 重大更新

  ### 新增功能

  #### 交互式菜单系统

  - 新增 `zcf menu` 命令（默认命令改为显示菜单）
  - 提供可视化配置管理界面
  - 支持所有功能的图形化操作

  #### AI 个性化配置

  - 支持多种预设 AI 人格（专业助手、猫娘助手、友好助手、导师模式）
  - 支持自定义 AI 人格
  - AI 输出语言独立配置

  #### 配置管理增强

  - API 配置支持部分修改
  - 新增默认模型配置功能
  - 新增 AI 记忆管理功能
  - 配置合并支持深度合并
  - 新增 ZCF 缓存清理功能

  #### 项目结构优化

  - 模板文件重构：CLAUDE.md 拆分为 rules.md、personality.md 和 mcp.md
  - 新增项目级 CLAUDE.md 模板
  - 代码模块化重构，提升可维护性

  ### 改进

  - 命令行体验优化
  - 错误处理增强
  - 跨平台兼容性提升

  ### 破坏性变更

  - `zcf` 默认命令从初始化改为显示菜单
  - 初始化命令改为 `zcf init` 或 `zcf i`
  - 模板文件结构调整

  ***

  ## ZCF 2.0.0 - Major Update

  ### New Features

  #### Interactive Menu System

  - Added `zcf menu` command (default command now shows menu)
  - Provides visual configuration management interface
  - Supports graphical operation for all features

  #### AI Personality Configuration

  - Support multiple preset AI personalities (Professional, Catgirl, Friendly, Mentor)
  - Support custom AI personality
  - Independent AI output language configuration

  #### Enhanced Configuration Management

  - API configuration supports partial modification
  - Added default model configuration
  - Added AI memory management
  - Configuration merge supports deep merge
  - Added ZCF cache cleanup

  #### Project Structure Optimization

  - Template files refactoring: CLAUDE.md split into rules.md, personality.md, and mcp.md
  - Added project-level CLAUDE.md template
  - Code modularization for better maintainability

  ### Improvements

  - Optimized CLI experience
  - Enhanced error handling
  - Improved cross-platform compatibility

  ### Breaking Changes

  - `zcf` default command changed from initialization to showing menu
  - Initialization command changed to `zcf init` or `zcf i`
  - Template file structure adjustment

## 1.2.0

### Minor Changes

- 添加 Windows 平台 MCP 配置支持

  - 自动检测 Windows 系统并使用兼容的 `cmd /c npx` 命令格式
  - 修复现有配置中的 Windows 兼容性问题
  - 添加平台检测工具函数 `isWindows()` 和 `getMcpCommand()`
  - 优化 MCP 配置生成逻辑，提取公共代码避免重复
  - 在 Windows 系统上显示友好提示信息
  - 更新中英文文档说明 Windows 支持

  Add Windows platform MCP configuration support

  - Auto-detect Windows system and use compatible `cmd /c npx` command format
  - Fix Windows compatibility issues in existing configurations
  - Add platform detection utilities `isWindows()` and `getMcpCommand()`
  - Optimize MCP config generation logic, extract common code to avoid duplication
  - Show friendly prompt on Windows systems
  - Update README documentation for Windows support

## 1.1.6

### Patch Changes

- **功能增强：配置完 API key 后自动添加 hasCompletedOnboarding 标志**

  - 在 ClaudeConfiguration 类型中添加 hasCompletedOnboarding 字段
  - 新增 addCompletedOnboarding() 函数自动设置完成标志
  - API 配置成功后自动跳过 Claude Code 官方登录流程
  - 重命名 McpConfiguration 为 ClaudeConfiguration 更准确反映用途

  **Feature Enhancement: Auto-add hasCompletedOnboarding flag after API key configuration**

  - Added hasCompletedOnboarding field to ClaudeConfiguration type
  - Implemented addCompletedOnboarding() function to automatically set completion flag
  - Automatically skip Claude Code official login process after successful API configuration
  - Renamed McpConfiguration to ClaudeConfiguration for more accurate representation

## 1.1.5

### Patch Changes

- **重构配置管理：优化 settings 配置管理**

  - **消除重复配置**: 移除 `configureApi` 函数中的硬编码配置
  - **单一数据源**: 从模板 `settings.json` 读取默认配置
  - **提升可维护性**: 配置修改只需更新模板文件
  - **遵循 DRY 原则**: 消除代码和模板间的配置重复

  **Refactor Configuration Management: Optimize settings configuration management**

  - **Removed duplicate configuration**: Eliminated hardcoded settings in `configureApi` function
  - **Single source of truth**: Now reads default settings from template `settings.json`
  - **Improved maintainability**: Configuration changes only need to be made in template file
  - **Following DRY principle**: Eliminated configuration duplication between code and templates

## 1.1.4

### Patch Changes

- **功能增强：增强 API 配置功能，支持选择 AUTH_TOKEN 或 API_KEY 认证方式**

  - 用户现在可以选择使用 ANTHROPIC_AUTH_TOKEN（OAuth 认证）或 ANTHROPIC_API_KEY（密钥认证）
  - 每个认证选项都提供了清晰的描述说明
  - 根据用户选择设置正确的环境变量
  - 更新了中英文文档说明

  **Feature Enhancement: Enhanced API configuration with AUTH_TOKEN or API_KEY authentication options**

  - Users can now choose between ANTHROPIC_AUTH_TOKEN (OAuth authentication) or ANTHROPIC_API_KEY (key authentication)
  - Each authentication option provides clear descriptive explanations
  - Sets correct environment variables based on user selection
  - Updated documentation in both Chinese and English

## 1.1.3

### Patch Changes

- **功能增强：添加 AI 输出语言选择功能**

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

  **Feature Enhancement: Added AI output language selection functionality**

  - 🌏 **Added AI output language selection**: Users can choose AI response language during initialization and updates

    - Support for multiple preset languages (Chinese, English, etc.)
    - Support for custom language input
    - Smart memory of user preferences to avoid repeated prompts

  - 🔧 **Code optimization**:

    - Refactored code structure, extracted common methods to `utils/prompts.ts`
    - Eliminated duplicate code in init and update commands
    - Optimized settings.json configuration structure, eliminated duplicate files

  - 📝 **Documentation updates**:
    - Updated README documentation with multilingual support instructions
    - Removed hardcoded language directives from templates

## 1.1.2

### Patch Changes

- **样式优化和文档改进**

  - **样式**: 更新 banner 文本对齐方式，提升视觉一致性
  - **文档**:
    - 移除 README 文件中的支持模型章节
    - 添加项目截图到 README 和 README_EN
    - 更新文档管理路径说明，明确计划存储位置为项目根目录下的 `.claude/plan/` 目录
    - 优化 README 文档中的命令说明和格式

  **Style optimization and documentation improvements**

  - **Style**: Updated banner text alignment for improved visual consistency
  - **Documentation**:
    - Removed supported models section from README file
    - Added project screenshots to README and README_EN
    - Updated documentation management path instructions, clarified plan storage location as `.claude/plan/` directory in project root
    - Optimized command descriptions and formatting in README documentation

## 1.1.1

### Patch Changes

- **优化文案和使用体验**

  - 更新文案：将"仅更新 Prompt 文档"改为"仅更新工作流相关 md"，更准确地描述功能
  - 改进快速开始指南：清晰区分首次使用和已有环境两种场景
  - 添加双语帮助信息：CLI help 命令现在同时显示中英文说明
  - 优化用户引导：明确说明 `npx zcf` 用于完整初始化，`npx zcf u` 用于仅导入工作流

  **Optimized copy and user experience**

  - Updated copy: Changed "Update Prompt documents only" to "Update workflow-related md only" for more accurate functionality description
  - Improved quick start guide: Clear distinction between first-time use and existing environment scenarios
  - Added bilingual help information: CLI help command now displays both Chinese and English instructions
  - Optimized user guidance: Clarified that `npx zcf` is for complete initialization, `npx zcf u` is for workflow import only

## 1.1.0

### Minor Changes

- **重大功能更新**

  - 添加 update 命令支持增量更新配置
  - 优化命令执行逻辑和错误处理
  - 改进用户体验和交互提示
  - 重构配置管理模块
  - 更新 README 文档

  **Major feature updates**

  - Added update command for incremental configuration updates
  - Optimized command execution logic and error handling
  - Improved user experience and interactive prompts
  - Refactored configuration management module
  - Updated README documentation

## 1.0.3

### Patch Changes

- **修复 commandExists 函数逻辑错误**

  - 修复了 commandExists 函数始终返回 true 的问题
  - 现在正确检查命令执行的 exitCode 来判断命令是否存在
  - 撤销了 1.0.2 版本中不必要的 Windows 特殊处理
  - 简化了安装流程，提升代码可维护性

  **Fixed commandExists function logic error**

  - Fixed the issue where commandExists function always returned true
  - Now correctly checks command execution exitCode to determine if command exists
  - Reverted unnecessary Windows special handling from version 1.0.2
  - Simplified installation process and improved code maintainability

## 1.0.2

### Patch Changes

- **修复 Windows 安装后 PATH 未刷新问题**

  - 添加 Windows 系统专属提示，提醒用户重新打开终端窗口
  - 优化安装验证逻辑，增加延迟检测
  - 改进安装流程追踪，仅在新安装时显示额外提醒

  **Fixed Windows PATH not refreshed after installation issue**

  - Added Windows-specific prompts to remind users to reopen terminal window
  - Optimized installation verification logic with delayed detection
  - Improved installation process tracking, showing extra reminders only for new installations

## 1.0.1

### Patch Changes

- **更新依赖，增加自动发布流水线**

  **Updated dependencies and added automated release pipeline**

## [1.0.0] - 2025-08-03

### Features

- **初始版本发布**
- 支持中英文双语配置
- 自动检测并安装 Claude Code
- 智能配置文件管理（备份、合并、跳过）
- MCP 服务自动配置
- 支持多种 MCP 服务：Context7、DeepWiki、Exa、Playwright 等
- 交互式命令行界面
- 跨平台支持（Windows、macOS、Linux）

**Initial version release**

- Support for Chinese and English bilingual configuration
- Automatic detection and installation of Claude Code
- Intelligent configuration file management (backup, merge, skip)
- Automatic MCP service configuration
- Support for multiple MCP services: Context7, DeepWiki, Exa, Playwright, etc.
- Interactive command line interface
- Cross-platform support (Windows, macOS, Linux)
