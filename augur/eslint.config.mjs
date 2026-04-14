// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: false,
  },
  dirs: {
    src: ['.'],
  },
}).append(
  {
    name: 'omenora/vue-pages',
    files: ['app/pages/**/*.vue', 'app/error.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    name: 'omenora/typescript-relaxed',
    files: ['server/**/*.ts', 'app/**/*.ts', 'app/**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'unicorn/prefer-number-properties': 'warn',
    },
  },
  {
    name: 'omenora/tests',
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
)
