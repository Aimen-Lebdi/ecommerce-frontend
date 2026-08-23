import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Design-token guard (DESIGN.md "One Family Rule"): ban raw Tailwind
    // palette color utilities so components can't bypass semantic tokens.
    // Feedback colors belong to --success/--warning/--info/--destructive;
    // neutrals belong to background/muted/border tokens. The single
    // sanctioned raw-color module is exempted in the block below.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/(?:text|bg|border|ring|from|to|via|fill|stroke|divide|outline|decoration|accent|caret|shadow)-(?:red|green|blue|yellow|orange|amber|purple|pink|teal|cyan|sky|rose|emerald|lime|indigo|violet|fuchsia|slate|gray|zinc|neutral|stone)-\\d{2,3}/]",
          message:
            'Raw Tailwind palette color detected - use semantic tokens instead (e.g. bg-warning/10, text-destructive, border-success/30, text-muted-foreground). See DESIGN.md One Family Rule.',
        },
        {
          selector:
            "TemplateElement[value.raw=/(?:text|bg|border|ring|from|to|via|fill|stroke|divide|outline|decoration|accent|caret|shadow)-(?:red|green|blue|yellow|orange|amber|purple|pink|teal|cyan|sky|rose|emerald|lime|indigo|violet|fuchsia|slate|gray|zinc|neutral|stone)-\\d{2,3}/]",
          message:
            'Raw Tailwind palette color in template literal - use semantic tokens instead (e.g. bg-warning/10, text-destructive, border-success/30, text-muted-foreground). See DESIGN.md One Family Rule.',
        },
      ],
    },
  },
  {
    // Sanctioned central status-color map — the one place raw palette
    // classes are allowed (consumed only via its exported helpers).
    files: ['src/utils/orderStatusStyles.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
])
