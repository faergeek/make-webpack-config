if (import.meta.webpackHot) {
  process.on('SIGUSR2', () => {
    import.meta.webpackHot.check(true);
  });
}
