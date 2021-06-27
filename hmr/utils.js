export function onceIdle(cb) {
  if (import.meta.webpackHot.status() === 'idle') {
    cb();
    return;
  }

  function statusHandler(status) {
    if (status === 'idle') {
      cb();
      import.meta.webpackHot.removeStatusHandler(statusHandler);
    }
  }

  import.meta.webpackHot.addStatusHandler(statusHandler);
}
