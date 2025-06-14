import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'react': reactPlugin,
      '@next/next': nextPlugin,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/no-unresolved': 'off',
      'sort-imports': 'off',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];