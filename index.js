import { fork } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import { TinyBrowserHmrWebpackPlugin } from '@faergeek/tiny-browser-hmr-webpack-plugin';
import browserslist from 'browserslist';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import escapeStringRegexp from 'escape-string-regexp';
import { browserslistToTargets } from 'lightningcss';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const require = createRequire(import.meta.url);
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const SIGNALS_ARE_SUPPORTED = process.platform !== 'win32';

class AssetsPlugin {
  constructor(filename) {
    this.filename = filename;
  }

  #groupAssetsByType(assets) {
    return assets.reduce(
      (result, asset) => {
        const ext = path.extname(asset.path).slice(1);

        if (result[ext]) {
          result[ext].push(asset);
        } else {
          result.auxiliary.push(asset);
        }

        return result;
      },
      {
        auxiliary: [],
        css: [],
        js: [],
      },
    );
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise({ name: 'AssetsPlugin' }, async stats => {
      const { assets, assetsByChunkName, entrypoints, publicPath } =
        stats.toJson({
          all: false,
          assets: true,
          cachedAssets: true,
          chunkGroupAuxiliary: true,
          entrypoints: true,
          publicPath: true,
        });

      const index = Object.fromEntries(
        assets
          .filter(
            item => item.type === 'asset' && !item.info.hotModuleReplacement,
          )
          .map(asset => [
            asset.name,
            {
              path: publicPath + asset.name,
              immutable: Boolean(asset.info.immutable),
            },
          ]),
      );

      const dynamicAssets = new Set(Object.values(index));
      const entriesAssets = new Set();

      const initial = Object.fromEntries(
        Object.values(entrypoints).map(entry => [
          entry.name,
          this.#groupAssetsByType(
            entry.assets
              .concat(entry.auxiliaryAssets)
              .map(asset => index[asset.name])
              .filter(asset => {
                if (!asset) return false;

                dynamicAssets.delete(asset);
                entriesAssets.add(asset);

                return true;
              }),
          ),
        ]),
      );

      const unnamedChunkAssets = new Set(dynamicAssets);

      const async = Object.fromEntries(
        Object.entries(assetsByChunkName)
          .map(([chunkName, chunkAssetNames]) => [
            chunkName,
            chunkAssetNames
              .map(assetName => index[assetName])
              .filter(asset => {
                if (!asset || !unnamedChunkAssets.has(asset)) return false;

                unnamedChunkAssets.delete(asset);

                return true;
              }),
          ])
          .filter(([, chunkAssets]) => chunkAssets.length !== 0)
          .map(([chunkName, chunkAssets]) => [
            chunkName,
            this.#groupAssetsByType(
              chunkAssets.filter(
                asset => asset != null && !entriesAssets.has(asset),
              ),
            ),
          ]),
      );

      async[''] = this.#groupAssetsByType(Array.from(unnamedChunkAssets));

      await mkdir(path.dirname(this.filename), { recursive: true });

      await writeFile(
        this.filename,
        JSON.stringify({ initial, async }, null, 2),
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

    compiler.hooks.afterEmit.tapPromise(this.constructor.name, async () => {
      if (this.child) {
        if (SIGNALS_ARE_SUPPORTED) {
          process.kill(this.child.pid, 'SIGUSR2');
        }
        return;
      }

      this.child = fork(this.path, {
        execArgv: ['--enable-source-maps', '--inspect=9229'],
        stdio: 'inherit',
      });

      await new Promise((resolve, reject) => {
        const handleMessage = message => {
          if (message === 'hmr-is-ready') {
            this.child.off('message', handleMessage);
            resolve();
          }
        };

        this.child.on('message', handleMessage);
        this.child.on('error', reject);
      });

      this.child.once('close', () => {
        this.child = null;
      });
    });

    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      Object.values(entry).forEach(entryValue => {
        entryValue.import.unshift(
          `@faergeek/make-webpack-config/hmr/node${
            SIGNALS_ARE_SUPPORTED ? '' : '?poll=1000'
          }`,
        );
      });
    });
  }
}

function makeConfig({
  alias,
  babelLoaderOptions,
  cache,
  dependencies,
  devtoolModuleFilenameTemplate,
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
  stats,
  target,
}) {
  const filename = `[name]${immutableAssets ? '.[contenthash]' : ''}.${
    target === 'node' ? 'cjs' : 'js'
  }`;

  return {
    dependencies,
    mode,
    entry,
    externals,
    externalsType,
    name,
    optimization,
    plugins,
    target,
    stats,
    ignoreWarnings: [/Failed to parse source map/],
    devtool: mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    cache,
    output: {
      chunkFilename: filename,
      devtoolModuleFilenameTemplate,
      filename,
      hotUpdateChunkFilename: `[id].[fullhash].hot-update.${
        target === 'node' ? 'cjs' : 'js'
      }`,
      iife: target == null,
      path: outputPath,
      publicPath: target == null ? '/' : undefined,
    },
    resolve: {
      alias,
      extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|tsx?)$/,
          include: srcPath,
          loader: require.resolve('babel-loader'),
          options: babelLoaderOptions,
        },
        {
          test: /\.css$/,
          use: (target == null ? [MiniCssExtractPlugin.loader] : []).concat([
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  namedExport: true,
                  exportOnlyLocals: target != null,
                  exportLocalsConvention: 'dashesOnly',
                  localIdentName:
                    mode === 'development'
                      ? '[local]@[name]#[contenthash:base64:5]'
                      : '[hash:base64]',
                },
              },
            },
            require.resolve('postcss-loader'),
          ]),
        },
        { test: /\.(css|js)$/, use: require.resolve('source-map-loader') },
        {
          test: /\.svg$/,
          oneOf: [
            {
              resourceQuery: /absolute/,
              type: 'asset/resource',
            },
            {
              resourceQuery: /inline/,
              type: 'asset/inline',
              generator: {
                dataUrl: content => svgToMiniDataURI(content.toString()),
              },
            },
            {
              type: 'asset/resource',
              generator: {
                emit: target == null,
                publicPath: '/',
              },
            },
          ],
        },
        {
          test: /\.(png|gif|jpe?g|ico|eot|otf|ttf|webp|woff2?)$/,
          oneOf: [
            {
              resourceQuery: /absolute/,
              type: 'asset/resource',
            },
            {
              resourceQuery: /inline/,
              type: 'asset/inline',
            },
            {
              type: 'asset/resource',
              generator: {
                emit: target == null,
                publicPath: '/',
              },
            },
          ],
        },
      ],
    },
  };
}

function mapEntryArrayOrString(entry, fn) {
  return Array.isArray(entry) ? fn(entry) : fn([entry]);
}

function mapObject(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );
}

function mapEntry(entry, fn) {
  if (Array.isArray(entry) || typeof entry === 'string') {
    return mapEntryArrayOrString(entry, fn);
  }

  return mapObject(entry, value => mapEntryArrayOrString(value, fn));
}

export default async function makeWebpackConfig({
  alias,
  analyze,
  analyzerPort = 8001,
  cache,
  define,
  dev,
  entry,
  paths,
  port = 8000,
  reactRefresh,
  watch,
}) {
  const pkg = require(
    path.relative(__dirname, path.resolve(process.cwd(), 'package.json')),
  );

  const env = dev ? 'development' : 'production';
  const stats = watch ? 'errors-warnings' : undefined;

  return [
    makeConfig({
      dependencies: ['webPage'],
      alias: {
        ...alias,
        'assets.json': path.join(paths.build, 'assets.json'),
      },
      cache,
      stats,
      mode: env,
      name: 'node',
      entry: entry.node,
      srcPath: paths.src,
      outputPath: paths.build,
      target: 'node',
      babelLoaderOptions: {
        envName: env,
        targets: 'current node',
      },
      devtoolModuleFilenameTemplate: path.relative(
        paths.build,
        '[resource-path]',
      ),
      externals: new RegExp(
        `^(${Object.keys(pkg.dependencies)
          .map(escapeStringRegexp)
          .join('|')})(/|$)`,
      ),
      externalsType: 'commonjs',
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('node'),
        }),
      ]
        .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
        .concat(
          watch ? [new NodeHmrPlugin(path.join(paths.build, 'main.cjs'))] : [],
        ),
    }),
    makeConfig({
      alias,
      cache,
      stats,
      mode: env,
      name: 'webPage',
      entry: mapEntry(entry.webPage, entryArray =>
        (watch && dev
          ? [
              require.resolve(
                '@faergeek/tiny-browser-hmr-webpack-plugin/client',
              ),
            ]
          : []
        ).concat(entryArray),
      ),
      srcPath: paths.src,
      outputPath: paths.public,
      babelLoaderOptions: {
        envName: env,
        plugins: [watch && dev && reactRefresh && 'react-refresh/babel'].filter(
          Boolean,
        ),
      },
      immutableAssets: true,
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('webPage'),
        }),
        new AssetsPlugin(path.join(paths.build, 'assets.json')),
        new MiniCssExtractPlugin({
          filename: dev ? '[name].css' : '[name].[contenthash].css',
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
                  generateStatsFile: true,
                  openAnalyzer: false,
                  reportFilename: path.join(
                    paths.build,
                    'webpack-bundle-analyzer.html',
                  ),
                  statsFilename: path.join(paths.build, 'stats.json'),
                }),
              ]
            : [],
        )
        .concat(
          watch && dev
            ? [
                new webpack.HotModuleReplacementPlugin(),
                new TinyBrowserHmrWebpackPlugin({ port }),
                reactRefresh &&
                  new (require('@pmmmwh/react-refresh-webpack-plugin'))({
                    overlay: false,
                  }),
              ].filter(Boolean)
            : [],
        ),
      optimization: {
        minimizer: [
          '...',
          new CssMinimizerPlugin({
            minify: CssMinimizerPlugin.lightningCssMinify,
            minimizerOptions: {
              targets: browserslistToTargets(browserslist()),
            },
          }),
        ],
        runtimeChunk: 'single',
        splitChunks: {
          cacheGroups: {
            default: false,
            defaultVendors: false,
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'initial',
              name: (module, chunks, cacheGroupKey) =>
                `${cacheGroupKey}-${chunks.map(chunk => chunk.name).join('&')}`,
            },
          },
        },
      },
    }),
    entry.serviceWorker &&
      makeConfig({
        dependencies: ['webPage'],
        alias: {
          ...alias,
          'assets.json': path.join(paths.build, 'assets.json'),
        },
        cache,
        stats,
        mode: env,
        name: 'service-worker',
        entry: {
          sw: entry.serviceWorker,
        },
        srcPath: paths.src,
        outputPath: paths.public,
        target: 'webworker',
        babelLoaderOptions: {
          envName: env,
        },
        plugins: [
          new webpack.DefinePlugin({
            ...define,
            __DEV__: JSON.stringify(dev),
            __ENTRY_TARGET__: JSON.stringify('serviceWorker'),
          }),
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          }),
        ].concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : []),
      }),
  ].filter(Boolean);
}
