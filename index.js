const AssetsPlugin = require('assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');
const { WebpackPluginServe } = require('webpack-plugin-serve');
const WebpackBar = require('webpackbar');

const ASSETS_RE = /\.(svg|png|gif|jpe?g|eot|ttf|woff2?)$/;

function makeConfig({
  alias,
  define,
  deps,
  dev,
  entry,
  name,
  node,
  paths,
  reactRefresh,
  watch,
}) {
  const babelPlugins = [];
  const plugins = [
    new WebpackBar({ name }),
    new webpack.DefinePlugin({
      ...define,
      __DEV__: JSON.stringify(dev),
      __NODE__: JSON.stringify(node),
    }),
  ];

  if (!node) {
    plugins.push(
      new AssetsPlugin({
        entrypoints: true,
        includeAuxiliaryAssets: true,
        includeDynamicImportedAssets: true,
        path: paths.build,
        prettyPrint: true,
        update: true,
      }),
      new MiniCssExtractPlugin({
        filename: watch ? '[name].css' : '[name].[contenthash].css',
      })
    );
  }

  if (watch) {
    plugins.push(new FriendlyErrorsWebpackPlugin({ clearConsole: false }));

    if (node) {
      plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new RunScriptWebpackPlugin({
          name: 'main.js',
          nodeArgs: ['--inspect=9229'],
          signal: true,
        })
      );
    } else {
      if (dev) {
        if (reactRefresh) {
          babelPlugins.push('react-refresh/babel');

          plugins.push(
            new (require('@pmmmwh/react-refresh-webpack-plugin'))({
              overlay: { sockIntegration: 'wps' },
            })
          );
        }
      } else {
        plugins.push(new BundleAnalyzerPlugin({ openAnalyzer: false }));
      }

      plugins.push(
        new WebpackPluginServe({
          client: { retry: true },
          hmr: dev ? 'refresh-on-failure' : false,
          log: { level: 'warn' },
          port: 8000,
          static: [paths.public],
          waitForBuild: true,
          middleware: (app, builtins) =>
            builtins.headers({ 'Access-Control-Allow-Origin': '*' }),
        })
      );
    }
  }

  function wrapEntry(entry) {
    return (
      node
        ? ['source-map-support/register', watch && 'webpack/hot/signal', entry]
        : [dev && watch && 'webpack-plugin-serve/client', entry]
    ).filter(Boolean);
  }

  return {
    name,
    dependencies: deps,
    target: node
      ? 'node'
      : dev
      ? 'browserslist:development'
      : 'browserslist:production',
    stats: watch ? 'none' : 'errors-warnings',
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    externals: node
      ? nodeExternals({ allowlist: [/^webpack\/hot/, ASSETS_RE] })
      : undefined,
    entry:
      typeof entry === 'string'
        ? wrapEntry(entry)
        : Object.fromEntries(
            Object.entries(entry).map(([k, v]) => [k, wrapEntry(v)])
          ),
    output: {
      chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      crossOriginLoading: watch ? 'anonymous' : undefined,
      devtoolModuleFilenameTemplate: node
        ? path.relative(paths.build, '[resource-path]')
        : undefined,
      filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      path: node ? paths.build : paths.public,
      publicPath: watch ? 'http://localhost:8000/' : '/',
    },
    resolve: {
      alias,
      extensions: ['.js', '.ts', '.tsx'],
      modules: ['node_modules', paths.src],
      symlinks: false,
    },
    module: {
      rules: [
        {
          test: /\.(js|tsx?)$/,
          include: paths.src,
          loader: require.resolve('babel-loader'),
          options: {
            envName: dev ? 'development' : 'production',
            plugins: babelPlugins,
          },
        },
        {
          test: /\.(css|sass|scss)$/,
          use: (node ? [] : [MiniCssExtractPlugin.loader]).concat([
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  exportOnlyLocals: node,
                  exportLocalsConvention: 'dashesOnly',
                  localIdentName: dev
                    ? '[local]@[1]#[contenthash:base64:5]'
                    : undefined,
                  localIdentRegExp: /\/([^/]*)\.module\.\w+$/i,
                },
              },
            },
            require.resolve('postcss-loader'),
          ]),
        },
        { test: /\.(css|js)$/, use: require.resolve('source-map-loader') },
        {
          test: /\.(sass|scss)$/,
          use: [
            {
              loader: require.resolve('resolve-url-loader'),
              options: { sourceMap: true },
            },
            require.resolve('sass-loader'),
          ],
        },
        {
          test: ASSETS_RE,
          type: 'javascript/auto',
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                emitFile: !node,
                limit: 4000,
                name: watch ? '[name].[ext]' : '[name].[contenthash].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins,
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
      runtimeChunk: node
        ? undefined
        : { name: entrypoint => `${entrypoint.name}.runtime` },
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/](?!webpack[\\/]hot[\\/])/,
            chunks: 'initial',
            name: (module, chunks, cacheGroupKey) =>
              `${cacheGroupKey}-${chunks.map(chunk => chunk.name).join('&')}`,
          },
          css: {
            type: 'css/mini-extract',
            name: 'main',
            chunks: 'async',
          },
        },
      },
    },
  };
}

function makeWebpackConfig({
  alias,
  define,
  dev,
  entry,
  paths,
  reactRefresh,
  watch,
}) {
  return [
    makeConfig({
      alias,
      define,
      dev,
      entry: entry.browser,
      name: 'browser',
      node: false,
      paths,
      reactRefresh,
      watch,
    }),
    makeConfig({
      alias,
      define,
      deps: ['browser'],
      dev,
      entry: entry.node,
      name: 'node',
      node: true,
      paths,
      reactRefresh,
      watch,
    }),
  ];
}

module.exports = makeWebpackConfig;
