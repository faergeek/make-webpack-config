/* eslint-env browser */
/* globals __resourceQuery, __webpack_hash__ */
import { onceIdle } from './utils';

if (import.meta.webpackHot) {
  let lastHash = __webpack_hash__;

  new EventSource(
    `http://${location.hostname}:${__resourceQuery.slice(1)}`
  ).addEventListener('check', event => {
    const newHash = event.data;

    if (newHash !== lastHash) {
      onceIdle(() => {
        import.meta.webpackHot
          .check(true)
          .then(updatedModules => {
            if (!updatedModules) {
              window.location.reload();
              throw new Error('Cannot find an update');
            }

            lastHash = newHash;
          })
          .catch(err => {
            location.reload();
            throw err;
          });
      });
    }
  });
}
