import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    '.bmad-core/**',
    '.claude/**',
    'templates/**',
  ],
  rules: {
    'no-console': 'off',
  },
})
