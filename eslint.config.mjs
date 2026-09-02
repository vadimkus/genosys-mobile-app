// Correctness only. This is not a style lint; it exists to catch the class of
// mistake that ships as a crash and that nothing else in the toolchain sees:
// a JSX component used without its import (the brand screen threw "Image is
// not defined" for a week after a refactor removed the import), a hook called
// where hooks cannot be called (the profile and product screens crashed on
// exactly that earlier this year), a reference to a name that does not exist.
// Run with `npm run verify:lint`; `verify:release` includes it.
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'dist/**', '.expo/**', 'scripts/**', 'targets/**', 'plugins/**'],
  },
  {
    files: ['app/**/*.js', 'components/**/*.js', 'contexts/**/*.js', 'services/**/*.js', 'utils/**/*.js', 'config/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        __DEV__: 'readonly',
        require: 'readonly',
        module: 'writable',
      },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-string-refs': 'error',
      'no-undef': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'no-self-assign': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unsafe-negation': 'error',
      'no-cond-assign': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
    },
  },
]
