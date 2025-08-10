# Fix Test Errors Plan

## Context
The project had 17 failing tests in the tools.test.ts and tools.edge.test.ts files. These tests were failing due to:
1. Invalid language handling causing undefined I18N access
2. Type errors when customArgs is not a string
3. Incorrect argument parsing for quoted strings

## Solution Implemented

### 1. Language Validation Enhancement
- Added validation to check if language exists in I18N object
- Implemented fallback to English ('en') for invalid languages
- Prevents TypeError when accessing undefined I18N properties

### 2. Type Safety for Custom Arguments
- Added null/undefined checks for customArgs
- Implemented String() conversion for non-string types
- Added proper handling for empty strings and whitespace

### 3. Intelligent Argument Parsing
- Implemented regex-based parsing to preserve quoted arguments
- Handles arguments with spaces inside quotes correctly
- Removes surrounding quotes from arguments
- Filters out empty arguments

### 4. Edge Case Handling
- Handles undefined/null mode values
- Processes tabs and newlines in arguments
- Supports extremely long arguments
- Handles numeric and object inputs gracefully

## Expected Results
- All 17 failing tests should pass
- No skipped tests
- Code handles all edge cases robustly
- Type checking passes
- Maintains backward compatibility

## Files Modified
- `src/utils/tools.ts` - Enhanced error handling and argument parsing

## Testing Commands
- `pnpm test:run` - Run all tests
- `pnpm typecheck` - Check TypeScript types