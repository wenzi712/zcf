# Technical Execution Guidelines

This document provides best practices that Claude Code should follow when executing specific technical tasks.

## Command Execution Best Practices

### Path Handling Standards

**Important**: Always use double quotes to wrap file paths when executing commands on all operating systems, especially on Windows.

#### Correct Examples
```bash
# ✅ Correct: Paths wrapped in double quotes
cd "C:\Users\name\My Documents"
python "C:\Program Files\MyApp\script.py"
node "/path/with spaces/app.js"
```

#### Incorrect Examples
```bash
# ❌ Incorrect: No quotes, backslashes will be swallowed on Windows
cd C:\Users\name\My Documents
python C:\Program Files\MyApp\script.py
```

### Cross-Platform Compatibility

- Prefer forward slashes `/` as path separators (supported by most tools)
- When backslashes must be used, ensure paths are wrapped in double quotes
- Be mindful of spaces and special characters even with relative paths

## Search Tool Usage Guidelines

### Content Search Priority

**Always prioritize `rg` (ripgrep) for file content searches** over `grep`.

> **Note**: ripgrep requires user installation. Most developers already have this tool installed. If `rg` command is not found, remind users to install:
> - macOS: `brew install ripgrep`
> - Windows: `scoop install ripgrep` or `choco install ripgrep`
> - Linux: `sudo apt-get install ripgrep` or see [official installation guide](https://github.com/BurntSushi/ripgrep#installation)

#### Reasons
1. **Superior Performance**: rg won't timeout in large codebases (e.g., Chromium, Emacs)
2. **Faster Execution**: rg is significantly faster than grep
3. **Smarter Defaults**: Automatically respects .gitignore files

#### Usage Examples
```bash
# ✅ Prefer rg
rg "search pattern" .
rg -i "case insensitive" src/
rg -t js "console.log" .

# ⚠️ Only use grep when rg is unavailable
grep -r "pattern" .
```

### File Finding
- Use Glob tool for filename pattern matching
- Use LS tool for directory listings
- Avoid using `find` command (specialized tools are more efficient)

## Tool Usage Principles

1. **Prefer Specialized Tools**: Use Read, Write, Edit tools instead of cat, echo commands
2. **Batch Operations**: Call multiple tools simultaneously for efficiency
3. **Error Handling**: Check for path quoting issues first when commands fail

## Performance Optimization Tips

- Use Task tool for complex searches in large projects
- Understand project structure before searching to narrow scope
- Use search parameters wisely (e.g., file type filters) for efficiency