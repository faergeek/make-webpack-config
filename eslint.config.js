import { base, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist']),
  {
    extends: [base, typescript],
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
]);
