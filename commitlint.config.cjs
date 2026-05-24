module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 自定义规则 - type枚举限制
    'type-enum': [
      2, // 表示错误级别
      'always', // 表示总是应用此规则
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档变更
        'style', // 代码格式调整
        'refactor', // 重构代码
        'test', // 测试相关
        'chore', // 构建过程或辅助工具变动
        'perf', // 性能优化
        'ci', // CI配置变更
        'build', // 构建相关
        'revert' // 回退提交
      ]
    ],
    // 限制主题最大长度
    'header-max-length': [2, 'always', 72],
    // 限制主题最小长度
    'subject-min-length': [2, 'always', 10],
    // 禁用大小写限制
    'subject-case': [0, 'never']
  }
};