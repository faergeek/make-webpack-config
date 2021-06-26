if (import.meta.webpackHot) {
  process.on('SIGUSR2', () => {
    if (import.meta.webpackHot.status() === 'idle') {
      import.meta.webpackHot.check(true);
    }
  });
}
