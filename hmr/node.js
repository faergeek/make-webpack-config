/* globals __resourceQuery */
import process from 'node:process';
import { setTimeout } from 'node:timers';
import { URLSearchParams } from 'node:url';

import pc from 'picocolors';

if (import.meta.webpackHot) {
  const pollParam = new URLSearchParams(__resourceQuery).get('poll');

  if (pollParam) {
    const pollInterval = parseInt(pollParam, 10);

    if (!isFinite(pollInterval)) {
      throw new Error('Incorrect value of poll param');
    }

    (async function poll() {
      try {
        await checkOnceIdle();
      } finally {
        setTimeout(poll, pollInterval);
      }
    })();
  } else {
    process.on('SIGUSR2', async () => {
      await checkOnceIdle();
    });
  }

  const LOG_PREFIX = '🔥 [HMR]';

  async function checkOnceIdle() {
    if (import.meta.webpackHot.status() !== 'idle') {
      await /** @type {Promise<void>} */ (
        new Promise(resolve => {
          /** @param {webpack.HotUpdateStatus} status */
          function statusHandler(status) {
            if (status !== 'idle') return;
            import.meta.webpackHot.removeStatusHandler(statusHandler);
            resolve();
          }

          import.meta.webpackHot.addStatusHandler(statusHandler);
        })
      );
    }

    try {
      await import.meta.webpackHot.check(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        pc.red(
          `${LOG_PREFIX} ${
            // avoid showing useless stacktrace
            err &&
            typeof err === 'object' &&
            'message' in err &&
            typeof err.message === 'string'
              ? err.message
              : err
          }`,
        ),
      );

      process.exit(1);
    }
  }
}
