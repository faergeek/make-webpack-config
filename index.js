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

class NodeHmrPlugin {
  constructor(filename) {
    this.child = null;
    this.path = filename;
  }

  apply(compiler) {
    new webpack.HotModuleReplacementPlugin().apply(compiler);

    compiler.hooks.done.tap(this.constructor.name, () => {
      if (this.child) {
        process.kill(this.child.pid, 'SIGUSR2');
        return;
      }

      this.child = spawn(
        'node',
        ['--enable-source-maps', '--inspect=9229', this.path],
        { stdio: 'inherit' }
      );

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

class BrowserHmrPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
    new webpack.HotModuleReplacementPlugin().apply(compiler);

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
  babelLoaderOptions,
  cache,
  devtoolModuleFilenameTemplate,
  emitAssets,
  entry,
  externals,
  externalsType,
  immutableAssets,
  mode,
  name,
  optimization,
  outputPath,
  plugins,
  srcPath,
  target,
}) {
  const filename = `[name]${immutableAssets ? '.[contenthash]' : ''}.js`;

  return {
    mode,
    entry,
    externals,
    externalsType,
    name,
    optimization,
    plugins,
    target,
    stats: 'errors-warnings',
    devtool: mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    cache: cache && {
      type: 'filesystem',
      version: '4',
      buildDependencies: {
        config: [getEntryModuleFilename()],
      },
    },
    output: {
      chunkFilename: filename,
      devtoolModuleFilenameTemplate,
      filename,
      path: outputPath,
      publicPath: '/',
    },
    resolve: {
      alias,
      extensions: ['.js', '.ts', '.tsx'],
      modules: ['node_modules', srcPath],
      symlinks: false,
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|mdx|tsx?)$/,
          include: srcPath,
          loader: require.resolve('babel-loader'),
          options: babelLoaderOptions,
        },
        { test: /\.mdx$/, use: '@mdx-js/loader' },
        {
          test: /\.(css|sass|scss)$/,
          use: (emitAssets ? [MiniCssExtractPlugin.loader] : []).concat([
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  namedExport: true,
                  exportOnlyLocals: !emitAssets,
                  exportLocalsConvention: 'dashesOnly',
                  localIdentName:
                    mode === 'development'
                      ? '[local]@[name]#[contenthash:base64:5]'
                      : undefined,
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
            emit: emitAssets,
            dataUrl: content => svgToMiniDataURI(content.toString()),
          },
        },
        {
          test: /\.(png|gif|jpe?g|ico|eot|otf|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: { emit: emitAssets },
        },
      ],
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

  const env = dev ? 'development' : 'production';

  return [
    makeConfig({
      alias,
      cache,
      mode: env,
      name: 'node',
      entry: entry.node,
      srcPath: paths.src,
      outputPath: paths.build,
      emitAssets: false,
      target: 'node',
      babelLoaderOptions: {
        envName: env,
        targets: 'current node',
      },
      devtoolModuleFilenameTemplate: path.relative(
        paths.build,
        '[resource-path]'
      ),
      externals: new RegExp(
        `^(${Object.keys(pkg.dependencies)
          .map(escapeStringRegexp)
          .join('|')})(/|$)`
      ),
      externalsType: 'commonjs',
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __NODE__: JSON.stringify(true),
        }),
      ]
        .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
        .concat(
          watch ? [new NodeHmrPlugin(path.join(paths.build, 'main.js'))] : []
        ),
    }),
    makeConfig({
      alias,
      cache,
      mode: env,
      name: 'browser',
      entry: entry.browser,
      srcPath: paths.src,
      outputPath: paths.public,
      emitAssets: true,
      babelLoaderOptions: {
        envName: env,
        plugins: [
          watch && dev && reactRefresh && 'react-refresh/babel',
          watch && dev && prefresh && '@prefresh/babel-plugin',
        ].filter(Boolean),
      },
      immutableAssets: !watch,
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __NODE__: JSON.stringify(false),
        }),
        new AssetsPlugin(path.join(paths.build, 'webpack-assets.json')),
        new MiniCssExtractPlugin({
          experimentalUseImportModule: false,
          filename: watch ? '[name].css' : '[name].[contenthash].css',
        }),
      ]
        .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
        .concat(
          analyze
            ? [
                new BundleAnalyzerPlugin({
                  analyzerHost: 'localhost',
                  analyzerMode: watch ? 'server' : 'static',
                  analyzerPort,
                  defaultSizes: 'gzip',
                  openAnalyzer: false,
                  reportFilename: path.join(
                    paths.build,
                    'webpack-bundle-analyzer.html'
                  ),
                  statsFilename: path.join(paths.build, 'stats.json'),
                }),
              ]
            : []
        )
        .concat(
          watch && dev
            ? [
                new BrowserHmrPlugin(port),
                reactRefresh &&
                  new (require('@pmmmwh/react-refresh-webpack-plugin'))(),
                prefresh && new (require('@prefresh/webpack'))(),
              ].filter(Boolean)
            : []
        ),
      optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
        runtimeChunk: extractRuntimeChunk
          ? { name: entrypoint => `runtime-${entrypoint.name}` }
          : undefined,
        splitChunks: {
          cacheGroups: {
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
    }),
  ];
}

module.exports = makeWebpackConfig;
