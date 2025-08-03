---
"zcf": patch
---

修复 commandExists 函数逻辑错误

- 修复了 commandExists 函数始终返回 true 的问题
- 现在正确检查命令执行的 exitCode 来判断命令是否存在
- 撤销了 1.0.2 版本中不必要的 Windows 特殊处理
- 简化了安装流程，提升代码可维护性