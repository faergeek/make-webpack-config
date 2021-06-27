/* eslint-env node */
import { onceIdle } from './utils';

if (import.meta.webpackHot) {
  process.on('SIGUSR2', () => {
    onceIdle(() => {
      import.meta.webpackHot.check(true);
    });
  });
}
