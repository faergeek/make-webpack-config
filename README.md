# make-webpack-config

![Build status](https://github.com/faergeek/make-webpack-config/actions/workflows/main.yml/badge.svg)

## Usage

First install it with npm:

```sh
npm install @faergeek/make-webpack-config
```

Or yarn:

```sh
yarn add @faergeek/make-webpack-config
```

Then use it in your `webpack.config.js`:

```javascript
const makeWebpackConfig = require('@faergeek/make-webpack-config');
const path = require('path');

module.exports = (env, argv) =>
  makeWebpackConfig({
    dev: argv.mode === 'development',
    port: 9000, // default is 8000
    extractRuntimeChunk: true,
    prefresh: true,
    reactRefresh: false,
    watch: argv.watch,
    paths: {
      build: path.resolve('build'),
      public: path.resolve('build', 'public'),
      src: path.resolve('src'),
    },
    entry: {
      node: './src',
      browser: {
        customer: './src/customer',
        admin: './src/admin',
      },
    },
    define: {
      __SOME_API_KEY__: JSON.stringify(process.env.SOME_API_KEY),
    },
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    },
  });
```
