# 技术执行指南

本文档提供 Claude Code 在执行具体技术任务时应遵循的最佳实践。

## 命令执行最佳实践

### 路径处理规范

**重要**：在所有操作系统上执行命令时，**始终使用双引号包裹文件路径**，特别是在 Windows 系统上。

#### 正确示例
```bash
# ✅ 正确：路径使用双引号
cd "C:\Users\name\My Documents"
python "C:\Program Files\MyApp\script.py"
node "/path/with spaces/app.js"
```

#### 错误示例
```bash
# ❌ 错误：未使用引号，Windows 下反斜杠会被吞掉
cd C:\Users\name\My Documents
python C:\Program Files\MyApp\script.py
```

### 跨平台兼容性

- 优先使用正斜杠 `/` 作为路径分隔符（大多数工具都支持）
- 当必须使用反斜杠时，确保路径被双引号包裹
- 使用相对路径时也要注意空格和特殊字符

## 搜索工具使用指南

### 内容搜索优先级

**始终优先使用 `rg` (ripgrep) 进行文件内容搜索**，而不是 `grep`。

> **注意**：ripgrep 需要用户自行安装。大多数开发者已经安装了此工具，如果遇到 `rg` 命令不存在，请提醒用户安装：
> - macOS: `brew install ripgrep`
> - Windows: `scoop install ripgrep` 或 `choco install ripgrep`
> - Linux: `sudo apt-get install ripgrep` 或查看 [官方安装指南](https://github.com/BurntSushi/ripgrep#installation)

#### 原因
1. **性能优越**：在大型代码库（如 Chromium、Emacs）中，rg 不会超时
2. **速度更快**：rg 的执行速度显著快于 grep
3. **默认配置更智能**：自动忽略 .gitignore 中的文件

#### 使用示例
```bash
# ✅ 优先使用 rg
rg "search pattern" .
rg -i "case insensitive" src/
rg -t js "console.log" .

# ⚠️ 仅在 rg 不可用时才使用 grep
grep -r "pattern" .
```

### 文件查找
- 使用 Glob 工具查找文件名模式
- 使用 LS 工具列出目录内容
- 避免使用 `find` 命令（使用专门的工具更高效）

## 工具使用原则

1. **优先使用专门的工具**：使用 Read、Write、Edit 等专门工具，而不是 cat、echo 等命令
2. **批量操作**：可以同时调用多个工具以提高效率
3. **错误处理**：命令失败后，先检查路径引号问题再重试

## 性能优化建议

- 对于大型项目，使用 Task 工具进行复杂搜索
- 搜索前先了解项目结构，缩小搜索范围
- 合理使用搜索参数（如文件类型过滤）以提高效率