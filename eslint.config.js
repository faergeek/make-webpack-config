import { base, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  { extends: [base, typescript] },
]);
