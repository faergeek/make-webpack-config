/* eslint-env browser */
/* globals __resourceQuery */
if (import.meta.webpackHot) {
  const evtSource = new EventSource(
    `http://${location.hostname}:${__resourceQuery.slice(1)}`
  );

  evtSource.addEventListener('check', () => {
    if (import.meta.webpackHot.status() === 'idle') {
      import.meta.webpackHot.check(true).catch(err => {
        location.reload();
        throw err;
      });
    }
  });
}
