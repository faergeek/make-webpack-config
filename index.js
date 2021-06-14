const AssetsPlugin = require('assets-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const path = require('path');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { WebpackPluginServe } = require('webpack-plugin-serve');
const WebpackBar = require('webpackbar');

function getEntryModuleFilename() {
  let mod = module;

  while (mod.parent) {
    mod = mod.parent;
  }

  return mod.filename;
}

function makeConfig({
  alias,
  cache,
  define,
  deps,
  dev,
  entry,
  externals,
  extractRuntimeChunk,
  name,
  node,
  paths,
  port,
  prefresh,
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

    if (!dev) {
      plugins.push(
        new BundleAnalyzerPlugin({
          analyzerHost: 'localhost',
          analyzerMode: watch ? 'server' : 'static',
          analyzerPort: 'auto',
          defaultSizes: 'gzip',
          generateStatsFile: true,
          openAnalyzer: false,
          reportFilename: path.join(
            paths.build,
            'webpack-bundle-analyzer.html'
          ),
          statsFilename: path.join(paths.build, 'stats.json'),
        })
      );
    }
  }

  if (watch) {
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

        if (prefresh) {
          babelPlugins.push('@prefresh/babel-plugin');
          plugins.push(new (require('@prefresh/webpack'))());
        }
      }

      plugins.push(
        new WebpackPluginServe({
          hmr: dev ? 'refresh-on-failure' : false,
          port,
          progress: false,
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
    stats: 'errors-warnings',
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    entry:
      typeof entry === 'string'
        ? wrapEntry(entry)
        : Object.fromEntries(
            Object.entries(entry).map(([k, v]) => [k, wrapEntry(v)])
          ),
    externals,
    cache: cache && {
      type: 'filesystem',
      version: '1',
      buildDependencies: {
        config: [getEntryModuleFilename()],
      },
    },
    output: {
      chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      crossOriginLoading: watch ? 'anonymous' : undefined,
      devtoolModuleFilenameTemplate: node
        ? path.relative(paths.build, '[resource-path]')
        : undefined,
      filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      path: node ? paths.build : paths.public,
      publicPath: watch ? `http://localhost:${port}/` : '/',
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
          use: (node
            ? []
            : [
                {
                  loader: MiniCssExtractPlugin.loader,
                  options: { modules: { namedExport: true } },
                },
              ]
          ).concat([
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  namedExport: true,
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
            {
              loader: require.resolve('sass-loader'),
              options: {
                implementation: require('node-sass'),
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          type: 'asset',
          generator: {
            emit: !node,
            dataUrl: content => svgToMiniDataURI(content.toString()),
          },
        },
        {
          test: /\.(png|gif|jpe?g|ico|eot|otf|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: { emit: !node },
        },
      ],
    },
    plugins,
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
      runtimeChunk:
        extractRuntimeChunk && !dev && !node
          ? { name: entrypoint => `runtime-${entrypoint.name}` }
          : undefined,
      splitChunks: !dev && {
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
  cache,
  define,
  dev,
  entry,
  extractRuntimeChunk,
  paths,
  port = 8000,
  prefresh,
  reactRefresh,
  watch,
}) {
  const pkg = require(path.relative(
    __dirname,
    path.resolve(process.cwd(), 'package.json')
  ));

  return [
    makeConfig({
      alias,
      cache,
      define,
      dev,
      entry: entry.browser,
      extractRuntimeChunk,
      name: 'browser',
      node: false,
      paths,
      port,
      prefresh,
      reactRefresh,
      watch,
    }),
    makeConfig({
      alias,
      cache,
      define,
      deps: watch ? undefined : ['browser'],
      dev,
      entry: entry.node,
      externals: Object.fromEntries(
        Object.keys(pkg.dependencies).map(dep => [dep, `commonjs ${dep}`])
      ),
      extractRuntimeChunk,
      name: 'node',
      node: true,
      paths,
      port,
      prefresh,
      reactRefresh,
      watch,
    }),
  ];
}

module.exports = makeWebpackConfig;
