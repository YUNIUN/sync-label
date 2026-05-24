# 贡献指南

## Git 提交规范

为了保持代码库历史记录的整洁和可读性，请遵循以下 Git 提交规范。

### 提交消息格式

提交消息应该按照以下格式编写：

```
<type>(<scope>): <subject>
```

其中：

- `type`: 提交类型（必需）
- `scope`: 影响范围（可选）
- `subject`: 简要描述（必需）

### Type 类型说明

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码逻辑）
- `refactor`: 重构代码（既不修复bug也不添加功能）
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动
- `perf`: 性能优化
- `ci`: CI配置变更
- `build`: 构建相关
- `revert`: 回退提交

### 示例

```
feat(user): 添加用户注册功能
fix(auth): 修复登录验证问题
docs(readme): 更新安装说明
style(components): 格式化按钮组件样式
refactor(api): 重构API请求方法
test(login): 添加登录模块单元测试
perf(list): 优化列表渲染性能
```

### 验证工具

本项目使用 husky 和 commitlint 来自动验证提交消息格式。如果提交的消息不符合规范，提交将会被拒绝。
