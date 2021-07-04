/* eslint-env node */
const { spawn } = require('child_process');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const escapeStringRegexp = require('escape-string-regexp');
const { mkdir, writeFile } = require('fs/promises');
const { createServer } = require('http');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const path = require('path');
const { default: SseStream } = require('ssestream');
const { pipeline } = require('stream');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

class AssetsPlugin {
  constructor(filename) {
    this.filename = filename;
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise({ name: 'AssetsPlugin' }, async stats => {
      const { assets, entrypoints, publicPath } = stats.toJson({
        all: false,
        assets: true,
        cachedAssets: true,
        entrypoints: true,
        publicPath: true,
      });

      const nonHmrAssetsIndex = Object.fromEntries(
        assets
          .filter(
            asset => asset.type === 'asset' && !asset.info.hotModuleReplacement
          )
          .map(asset => [asset.name, asset])
      );

      const assetsByEntrypoint = Object.fromEntries(
        Object.values(entrypoints).map(entrypoint => [
          entrypoint.name,
          entrypoint.assets
            .map(asset => nonHmrAssetsIndex[asset.name])
            .filter(Boolean)
            .reduce(
              (result, asset) => {
                const ext = path.extname(asset.name).slice(1);

                if (result[ext]) {
                  result[ext].push(
                    publicPath === 'auto' ? asset.name : publicPath + asset.name
                  );
                }

                return result;
              },
              {
                css: [],
                js: [],
              }
            ),
        ])
      );

      await mkdir(path.dirname(this.filename), { recursive: true });

      await writeFile(
        this.filename,
        JSON.stringify(assetsByEntrypoint, null, 2)
      );
    });
  }
}

class LaunchPlugin {
  constructor(filename) {
    this.child = null;
    this.path = filename;
  }

  apply(compiler) {
    compiler.hooks.done.tap(this.constructor.name, () => {
      if (this.child) {
        process.kill(this.child.pid, 'SIGUSR2');
        return;
      }

      this.child = spawn('node', ['--inspect=9229', this.path], {
        stdio: 'inherit',
      });

      this.child.on('close', () => {
        this.child = null;
      });
    });

    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      Object.values(entry).forEach(entryValue => {
        entryValue.import.unshift('@faergeek/make-webpack-config/hmr/node');
      });
    });
  }
}

class ServerPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
    let latestHash;
    const streams = [];

    createServer(async (req, res) => {
      const stream = new SseStream(req);

      res.setHeader('Access-Control-Allow-Origin', '*');

      pipeline(stream, res, () => {
        res.end();
        const index = streams.indexOf(stream);
        if (index !== -1) {
          streams.splice(index, 1);
        }
      });

      streams.push(stream);

      if (latestHash) {
        stream.write({ event: 'check', data: latestHash });
      }
    }).listen(this.port);

    compiler.hooks.done.tap(this.constructor.name, stats => {
      latestHash = stats.hash;

      streams.forEach(stream => {
        stream.write({ event: 'check', data: latestHash });
      });
    });

    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      Object.values(entry).forEach(entryValue => {
        entryValue.import.unshift(
          `@faergeek/make-webpack-config/hmr/browser?${this.port}`
        );
      });
    });
  }
}

function getEntryModuleFilename() {
  let mod = module;

  while (mod.parent) {
    mod = mod.parent;
  }

  return mod.filename;
}

function makeConfig({
  alias,
  analyze,
  analyzerPort,
  cache,
  define,
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
    new webpack.DefinePlugin({
      ...define,
      __DEV__: JSON.stringify(dev),
      __NODE__: JSON.stringify(node),
    }),
  ];

  if (process.stdout.isTTY) {
    plugins.push(new webpack.ProgressPlugin());
  }

  if (!node) {
    plugins.push(
      new AssetsPlugin(path.join(paths.build, 'webpack-assets.json')),
      new MiniCssExtractPlugin({
        filename: watch ? '[name].css' : '[name].[contenthash].css',
      })
    );

    if (analyze) {
      plugins.push(
        new BundleAnalyzerPlugin({
          analyzerHost: 'localhost',
          analyzerMode: watch ? 'server' : 'static',
          analyzerPort,
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
        new LaunchPlugin(path.join(paths.build, 'main.js'))
      );
    } else {
      plugins.push(new ServerPlugin(port));

      if (dev) {
        plugins.push(new webpack.HotModuleReplacementPlugin());

        if (reactRefresh) {
          babelPlugins.push('react-refresh/babel');
          plugins.push(new (require('@pmmmwh/react-refresh-webpack-plugin'))());
        }

        if (prefresh) {
          babelPlugins.push('@prefresh/babel-plugin');
          plugins.push(new (require('@prefresh/webpack'))());
        }
      }
    }
  }

  if (node) {
    plugins.push(compiler => {
      compiler.hooks.entryOption.tap('SourceMapSupport', (context, entry) => {
        Object.values(entry).forEach(entryValue => {
          entryValue.import.unshift('source-map-support/register');
        });
      });
    });
  }

  return {
    name,
    mode: dev ? 'development' : 'production',
    target: node
      ? 'node'
      : dev
      ? 'browserslist:development'
      : 'browserslist:production',
    stats: 'errors-warnings',
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    entry,
    externals,
    externalsType: node ? 'commonjs' : undefined,
    cache: cache && {
      type: 'filesystem',
      version: '4',
      buildDependencies: {
        config: [getEntryModuleFilename()],
      },
    },
    output: {
      chunkFilename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      devtoolModuleFilenameTemplate: node
        ? path.relative(paths.build, '[resource-path]')
        : undefined,
      filename: `[name]${node || watch ? '' : '.[contenthash]'}.js`,
      path: node ? paths.build : paths.public,
      publicPath: '/',
    },
    resolve: {
      alias,
      extensions: ['.js', '.ts', '.tsx'],
      modules: ['node_modules', paths.src],
      symlinks: false,
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mdx|tsx?)$/,
          include: paths.src,
          loader: require.resolve('babel-loader'),
          options: {
            envName: dev ? 'development' : 'production',
            plugins: babelPlugins,
          },
        },
        { test: /\.mdx$/, use: '@mdx-js/loader' },
        {
          test: /\.(css|sass|scss)$/,
          use: (node ? [] : [MiniCssExtractPlugin.loader]).concat([
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
        extractRuntimeChunk && !node
          ? { name: entrypoint => `runtime-${entrypoint.name}` }
          : undefined,
      splitChunks: {
        cacheGroups: {
          hmr: {
            test: /[\\/]node_modules[\\/](@faergeek[\\/]make-webpack-config[\\/]hmr[\\/]browser\.js|mini-css-extract-plugin[\\/]dist[\\/]hmr[\\/])/,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: false,
            priority: 1,
            name: 'hmr',
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
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
  analyze,
  analyzerPort = 8001,
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
      analyze,
      analyzerPort,
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
      analyze,
      analyzerPort,
      cache,
      define,
      dev,
      entry: entry.node,
      externals: new RegExp(
        `^(${Object.keys(pkg.dependencies)
          .map(dep => escapeStringRegexp(dep))
          .join('|')})(/|$)`
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
