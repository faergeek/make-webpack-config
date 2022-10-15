/* eslint-env node */
/* globals __resourceQuery */
import { onceIdle } from './utils';

if (import.meta.webpackHot) {
  const searchParams = new URLSearchParams(__resourceQuery);
  const pollParam = searchParams.get('poll');

  if (pollParam) {
    const pollInterval = parseInt(pollParam, 10);

    if (!pollInterval || !isFinite(pollInterval)) {
      throw new Error('Incorrect value of poll param');
    }

    const checkForUpdates = () => {
      onceIdle(() => {
        import.meta.webpackHot.check(true).finally(() => {
          setTimeout(checkForUpdates, pollInterval);
        });
      });
    };

    checkForUpdates();
  } else {
    process.on('SIGUSR2', () => {
      onceIdle(() => {
        import.meta.webpackHot.check(true);
      });
    });
  }
}
