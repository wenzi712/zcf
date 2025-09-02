import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '.bmad-core/**',
    '.claude/**',
    '**/**.md',
  ],
  rules: {
    'no-console': 'off',
  },
})
