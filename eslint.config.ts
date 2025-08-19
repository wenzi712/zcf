import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '.bmad-core/**',
    '.claude/**',
  ],
  rules: {
    'no-console': 'off',
  },
})
