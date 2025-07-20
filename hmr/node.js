/* globals __resourceQuery */
import process from 'node:process';
import { setTimeout } from 'node:timers';
import { URLSearchParams } from 'node:url';

/** @param {() => void} cb */
function onceIdle(cb) {
  if (import.meta.webpackHot.status() === 'idle') {
    cb();
    return;
  }

  /** @param {webpack.HotUpdateStatus} status */
  function statusHandler(status) {
    if (status === 'idle') {
      cb();
      import.meta.webpackHot.removeStatusHandler(statusHandler);
    }
  }

  import.meta.webpackHot.addStatusHandler(statusHandler);
}

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

    if (!process.send) throw new Error('IPC channel must be set up');
    process.send('hmr-is-ready');
  }
}
