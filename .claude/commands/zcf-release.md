# ZCF Release - Automated Release and Commit

Automate version release and code commit using changeset.

## Usage

```bash
/zcf-release [-p|-mi|-ma]
```

## Parameters

- `-p` or `--patch`: Patch version (default) - bug fixes, minor changes
- `-mi` or `--minor`: Minor version - new features, backward compatible
- `-ma` or `--major`: Major version - breaking changes, incompatible

## Context

- Automatically analyze code changes and generate bilingual CHANGELOG
- Use changeset for version management
- Auto commit code changes (NO manual tags)
- Support GitHub Actions auto publish to npm with automatic tagging

## Your Role

You are a professional release management assistant responsible for:

1. Analyzing code changes
2. Generating standardized CHANGELOG
3. Executing version release process

## Execution Flow

Parse arguments: $ARGUMENTS

### 1. Parameter Parsing

```bash
VERSION_TYPE="patch"  # Default to patch version

case "$ARGUMENTS" in
  -p|--patch)
    VERSION_TYPE="patch"
    ;;
  -mi|--minor)
    VERSION_TYPE="minor"
    ;;
  -ma|--major)
    VERSION_TYPE="major"
    ;;
  "")
    VERSION_TYPE="patch"
    ;;
  *)
    echo "Unknown parameter: $ARGUMENTS"
    echo "Usage: /zcf-release [-p|-mi|-ma]"
    exit 1
    ;;
esac

echo "🚀 Preparing to release $VERSION_TYPE version"
```

### 2. Check Working Directory Status

Check if the current working directory meets release conditions:

```bash
# Ensure in project root directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found, please run in project root"
  exit 1
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  Detected uncommitted changes:"
  git status --short
  echo ""
  read -p "Commit these changes first? [Y/n] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo "Please commit changes before releasing"
    exit 1
  fi
fi

echo "✅ Working directory status OK"
```

### 3. Analyze Version Changes

Analyze all changes since last release:

```bash
# Get last release tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
  echo "📊 No previous version tag found, analyzing all commits"
  COMMITS=$(git log --oneline)
else
  echo "📊 Last version: $LAST_TAG"
  echo "Analyzing changes since $LAST_TAG..."
  COMMITS=$(git log $LAST_TAG..HEAD --oneline)
fi

# Show commit history
echo -e "\n📝 Changes:"
echo "$COMMITS"

# Analyze file changes
echo -e "\n📁 File change statistics:"
if [ -z "$LAST_TAG" ]; then
  git diff --stat
else
  git diff --stat $LAST_TAG..HEAD
fi
```

### 4. Check and Update README Files

Analyze changes and update README files if necessary:

```bash
echo -e "\n📚 Checking if README files need updates..."

# Analyze changed files to determine if feature documentation needs updating
CHANGED_FILES=$(git diff $LAST_TAG..HEAD --name-only 2>/dev/null || git diff --name-only)

# Check if there are significant code changes
if echo "$CHANGED_FILES" | grep -qE "(src/|lib/|commands/|utils/|templates/)"; then
  echo "🔍 Detected code changes, analyzing features..."

  # Prepare update summary based on commits
  echo -e "\n📝 Feature changes summary:"

  # Analyze key feature changes
  FEATURE_CHANGES=""

  # Check for new commands
  if echo "$CHANGED_FILES" | grep -q "commands/"; then
    echo "  - New or modified commands detected"
    FEATURE_CHANGES="commands"
  fi

  # Check for new workflows
  if echo "$CHANGED_FILES" | grep -q "workflow"; then
    echo "  - Workflow system changes detected"
    FEATURE_CHANGES="$FEATURE_CHANGES workflows"
  fi

  # Check for MCP service updates
  if echo "$CHANGED_FILES" | grep -q "mcp"; then
    echo "  - MCP service updates detected"
    FEATURE_CHANGES="$FEATURE_CHANGES mcp"
  fi

  # Check for API configuration changes
  if echo "$CHANGED_FILES" | grep -q "api\|config"; then
    echo "  - Configuration system changes detected"
    FEATURE_CHANGES="$FEATURE_CHANGES config"
  fi

  if [ -n "$FEATURE_CHANGES" ]; then
    echo -e "\n📋 README files that may need updates:"
    echo "  - README.md (English version)"
    echo "  - README_zh-CN.md (Chinese version)"

    echo -e "\n🤖 I will now update README files based on the changes..."
    # The actual README update will be done by analyzing the code changes
    # and updating the relevant sections (Features, Usage, Configuration, etc.)
  else
    echo "✅ No significant feature changes detected, README update not required"
  fi
else
  echo "✅ No code changes detected, README update not required"
fi
```

**README Update Guidelines**:

When updating README files, follow these principles:

1. **Feature Section Updates**:

   - Add new features to the feature list
   - Update command descriptions if modified
   - Keep bilingual consistency (README.md and README_zh-CN.md)

2. **Version Compatibility**:

   - Update version requirements if needed
   - Add migration notes for breaking changes

3. **Documentation Structure**:

   - Maintain consistent formatting
   - Update table of contents if sections added
   - Keep examples up-to-date

4. **Common Update Areas**:
   - Features list
   - Installation instructions
   - Configuration options
   - Command usage examples
   - Workflow descriptions
   - MCP service list

### 5. Generate CHANGELOG Content

Based on code change analysis, I will generate CHANGELOG following these standards:

**Format Requirements**:

1. Chinese description first, English description second
2. No mixing Chinese and English on the same line
3. Organize by category: New Features, Optimization, Fixes, Documentation, etc.
4. Each entry should be concise and clear

**Example Format**:

```markdown
## 新功能

- 添加技术执行指南文档，提供命令执行最佳实践
- 支持自动化发版命令 /zcf-release
- Windows 路径自动加引号处理

## New Features

- Add technical execution guidelines with command best practices
- Support automated release command /zcf-release
- Automatic quote handling for Windows paths

## 优化

- 优先使用 ripgrep 提升搜索性能
- 改进模板文件组织结构

## Optimization

- Prioritize ripgrep for better search performance
- Improve template file organization

## 修复

- 修复 Windows 路径反斜杠丢失问题

## Fixes

- Fix Windows path backslash escaping issue
```

### 6. Create Changeset

Create changeset file based on analysis:

```bash
# Generate timestamp
TIMESTAMP=$(date +%Y%m%d%H%M%S)
CHANGESET_FILE=".changeset/release-$TIMESTAMP.md"

# Create changeset file
echo "📝 Creating changeset file..."
cat > "$CHANGESET_FILE" << 'EOF'
---
"zcf": $VERSION_TYPE
---

[Bilingual CHANGELOG content generated based on actual changes]
EOF

echo "✅ Changeset file created: $CHANGESET_FILE"
```

### 7. Update Version Number

Use changeset to update version number and CHANGELOG:

```bash
echo "🔄 Updating version number and CHANGELOG..."
pnpm changeset version

# Note: The changeset version command will automatically:
# 1. Update package.json version
# 2. Generate/update CHANGELOG.md
# 3. DELETE the temporary changeset file in .changeset/ directory
# No manual cleanup needed!

# Get new version number
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📦 New version: v$NEW_VERSION"

# Show CHANGELOG update
echo -e "\n📋 CHANGELOG has been updated, please review the content"
echo "✅ Temporary changeset file has been automatically deleted"
```

### 8. Update README Files if Needed

After version update, actually update README files if features changed:

```bash
# Execute README updates if feature changes were detected
if [ -n "$FEATURE_CHANGES" ]; then
  echo -e "\n📝 Updating README files with new features..."
  
  # Note: At this point, Claude Code will analyze the actual code changes
  # and update the README.md and README_zh-CN.md files accordingly
  # This includes:
  # - Adding new features to feature lists
  # - Updating usage examples
  # - Modifying configuration documentation
  # - Ensuring bilingual consistency
  
  echo "✅ README files have been updated"
  
  # Show the changes for review
  echo -e "\n📊 README changes summary:"
  git diff --stat README.md README_zh-CN.md
fi
```

### 9. Create Release Commit

Commit all changes (including README updates if any):

````bash
echo "💾 Committing release changes..."

# Add all changes
git add .

# Prepare commit message
COMMIT_MSG="chore: release v$NEW_VERSION

- Update version to $NEW_VERSION
- Update CHANGELOG.md"

# Add README update note if applicable
if [ -n "$FEATURE_CHANGES" ]; then
  COMMIT_MSG="$COMMIT_MSG
- Update README files with new features"
fi

COMMIT_MSG="$COMMIT_MSG
- Generated by /zcf-release command"

# Create release commit
git commit -m "$COMMIT_MSG"

### 10. Push to Remote Repository (NO TAGS!)

```bash
echo "🚀 Pushing to remote repository..."

# Push main branch ONLY - NO TAGS!
git push origin main

echo -e "\n✅ Release preparation complete!"
echo "📦 Version v$NEW_VERSION is ready"
echo "⚠️  IMPORTANT: Do NOT create or push tags manually!"
echo "🤖 GitHub Actions will automatically:"
echo "   - Create the release tag"
echo "   - Publish to npm"
echo "   - Generate GitHub Release"
echo "👀 View release status: https://github.com/UfoMiao/zcf/actions"
````

## Complete Workflow Summary

1. **Preparation Phase**: Check parameters, working directory status
2. **Analysis Phase**: Analyze commit history and file changes
3. **README Check Phase**: Check if README files need updates based on changes
4. **Generation Phase**: Create bilingual CHANGELOG
5. **Execution Phase**: Update version, update README if needed, commit, push (NO TAGS!)
6. **Release Phase**: GitHub Actions auto publish with automatic tagging

## Important Notes

⚠️ **CRITICAL**: **NEVER create or push Git tags manually!** GitHub Actions will automatically:

- Create the version tag after successful build
- Generate GitHub Release
- Publish to npm registry

Manual tags will cause conflicts with the automated release process!

Other notes:

- Ensure all code has been tested
- CHANGELOG must follow bilingual format standards
- Choose the correct version type
- Carefully review CHANGELOG content before release
- **No manual cleanup needed**: `changeset version` automatically deletes temporary changeset files
- The `.changeset/` directory should only contain config files, not temporary release files

---

**Now starting release process...**
