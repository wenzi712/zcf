# Technical Execution Guidelines

This document provides best practices for Claude Code when executing technical tasks.

## Dangerous Operations Confirmation

**Important**: The following operations require explicit user confirmation before execution:

### Operations Requiring Confirmation

- **File System**: Delete files/directories, bulk modifications, move system files
- **Code Commits**: `git commit`, `git push`, `git reset --hard`
- **System Config**: Modify environment variables, system settings, permissions
- **Data Operations**: Database deletions, schema changes, bulk updates
- **Network Requests**: Send sensitive data, call production APIs
- **Package Management**: Global install/uninstall, update core dependencies

### Confirmation Process

Before executing dangerous operations:

1. Clearly explain the operation and its impacts
2. Wait for explicit user confirmation (e.g., "yes", "confirm", "proceed")
3. If user hesitates or declines, provide more information or alternatives

## Command Execution Best Practices

### Path Handling Standards

**Important**: Always use double quotes to wrap file paths when executing commands.

```bash
# ✅ Correct
cd "C:\Users\name\My Documents"
node "/path/with spaces/app.js"

# ❌ Incorrect
cd C:\Users\name\My Documents
```

### Cross-Platform Compatibility

- Prefer forward slashes `/` as path separators
- When using backslashes, ensure paths are double-quoted

## Search Tool Usage

### Content Search

**Always prioritize `rg` (ripgrep)** - faster and won't timeout.

```bash
# ✅ Preferred
rg "pattern" .
rg -t js "console.log" .

# ⚠️ Fallback
grep -r "pattern" .
```

> Note: If `rg` unavailable, remind user to install: `brew/scoop/apt install ripgrep`

### File Finding

- Use Glob tool for pattern matching
- Use LS tool for directory listings
- Avoid using `find` command

## Tool Usage Principles

1. **Prefer Specialized Tools**: Use Read, Write, Edit instead of cat, echo
2. **Batch Operations**: Call multiple tools simultaneously for efficiency
3. **Error Handling**: Check path quoting first when commands fail

## Performance Optimization

- Use Task tool for complex searches in large projects
- Understand project structure before searching
- Use file type filters wisely for efficiency

## Documentation Update Check

Automatically check documentation update needs after task completion:

### Criteria

- **New Features**: Update README, CHANGELOG, usage docs
- **API Changes**: Update API docs, type definitions, interface specs
- **Config Changes**: Update config guides, CLAUDE.md, env var docs
- **Bug Fixes**: Usually no doc updates needed (unless usage affected)

### Process

1. Analyze code change type and impact scope
2. Auto-identify documentation files in project
3. List documents needing updates
4. Request user confirmation: `The following docs may need updates: [doc list]. Would you like me to update them?`
5. Update relevant docs after confirmation

### Common Document Types

- **README.md**: Features, usage, configuration
- **CHANGELOG.md**: Version history
- **CLAUDE.md**: AI assistant config and instructions
- **API Docs**: Interface definitions, parameters
- **Config Docs**: Environment variables, settings

## AI Assistant Behavior Guidelines

The following guidelines define core behavioral standards that AI assistants should follow when executing tasks:

### 1. Persist Until Complete Resolution

Remember, you are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.

### 2. Base Responses on Facts, Not Guesses

If you are not sure about information pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

### 3. Plan Extensively and Reflect Thoroughly

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls, ensuring user's query is completely resolved. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully. In addition, ensure function calls have the correct arguments.

### 4. Read Before Write Principle

Before updating or modifying files, first use the Read tool to read the file contents.
