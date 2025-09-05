import { ChildProcess, fork } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';

import { TinyBrowserHmrWebpackPlugin } from '@faergeek/tiny-browser-hmr-webpack-plugin';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import * as LightningCss from 'lightningcss';
import { LightningCssMinifyPlugin } from 'lightningcss-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const require = createRequire(import.meta.url);

const SIGNALS_ARE_SUPPORTED = process.platform !== 'win32';

/**
 * @typedef {Object} Asset
 * @property {boolean} immutable
 * @property {string} path
 */

/**
 * @typedef {Object} GroupedAssets
 * @property {Asset[]} auxiliary
 * @property {Asset[]} css
 * @property {Asset[]} js
 */

/** @param {string} filename */
function makeAssetsPlugin(filename) {
  /** @this {webpack.Compiler} */
  return function AssetsPlugin() {
    /** @param {Asset[]} assets */
    function groupAssetsByType(assets) {
      /** @type {GroupedAssets} */
      const groups = { auxiliary: [], css: [], js: [] };

      assets.forEach(asset => {
        const ext = path.extname(asset.path).slice(1);

        if (ext === 'css' || ext === 'js') {
          groups[ext].push(asset);
        } else {
          groups.auxiliary.push(asset);
        }
      });

      return groups;
    }

    this.hooks.thisCompilation.tap(AssetsPlugin.name, compilation => {
      compilation.hooks.processAssets.tap(AssetsPlugin.name, () => {
        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true,
          chunkGroupAuxiliary: true,
          entrypoints: true,
          publicPath: true,
        });

        if (!stats.assets) throw new Error('assets must be present');

        const publicPath = stats.publicPath;
        if (!publicPath) throw new Error('entrypoints must be present');

        const assetsIndex = new Map(
          stats.assets
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

        if (!stats.entrypoints) throw new Error('entrypoints must be present');

        const dynamicAssets = new Set(assetsIndex.values());

        /** @type {Set<Asset>} */
        const entriesAssets = new Set();

        const initial = Object.fromEntries(
          Object.values(stats.entrypoints).map(entry => {
            if (!entry.assets || !entry.auxiliaryAssets || !entry.name) {
              throw new Error(
                'assets, auxiliaryAssets and name must be present',
              );
            }

            return [
              entry.name,
              groupAssetsByType(
                entry.assets
                  .concat(entry.auxiliaryAssets)
                  .map(asset => assetsIndex.get(asset.name))
                  .filter(asset => asset != null)
                  .map(asset => {
                    dynamicAssets.delete(asset);
                    entriesAssets.add(asset);

                    return asset;
                  }),
              ),
            ];
          }),
        );

        if (!stats.assetsByChunkName) {
          throw new Error('assetsByChunkName must be present');
        }

        const unnamedChunkAssets = new Set(dynamicAssets);

        const assetsByChunkName = new Map(
          Object.entries(stats.assetsByChunkName).map(
            ([chunkName, chunkAssetNames]) => [
              chunkName,
              chunkAssetNames
                .map(assetName => assetsIndex.get(assetName))
                .filter(asset => asset != null)
                .filter(asset => unnamedChunkAssets.has(asset))
                .map(asset => {
                  unnamedChunkAssets.delete(asset);

                  return asset;
                }),
            ],
          ),
        );

        const async = Object.fromEntries(
          assetsByChunkName
            .entries()
            .filter(([, chunkAssets]) => chunkAssets.length !== 0)
            .map(([chunkName, chunkAssets]) => [
              chunkName,
              groupAssetsByType(
                chunkAssets.filter(asset => !entriesAssets.has(asset)),
              ),
            ]),
        );

        if (unnamedChunkAssets.size !== 0) {
          async[''] = groupAssetsByType(Array.from(unnamedChunkAssets));
        }

        compilation.emitAsset(
          path.relative(this.outputPath, filename),
          new webpack.sources.RawSource(
            JSON.stringify({ initial, async }, null, 2),
          ),
        );
      });
    });
  };
}

class NodeHmrPlugin {
  /** @type {ChildProcess | null} */
  child;
  path;

  /** @param {string} filename */
  constructor(filename) {
    this.child = null;
    this.path = filename;
  }

  /** @param {webpack.Compiler} compiler */
  apply(compiler) {
    new webpack.HotModuleReplacementPlugin().apply(compiler);

    compiler.hooks.afterEmit.tapPromise(this.constructor.name, async () => {
      if (this.child) {
        if (SIGNALS_ARE_SUPPORTED) {
          if (!this.child.pid) throw new Error('pid must be present');
          process.kill(this.child.pid, 'SIGUSR2');
        }
        return;
      }

      this.child = fork(this.path, {
        execArgv: ['--enable-source-maps', '--inspect=9229'],
        stdio: 'inherit',
      });

      const child = this.child;

      await /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
          /** @param {import('node:child_process').Serializable} message */
          function handleMessage(message) {
            if (message === 'hmr-is-ready') {
              teardown();
              resolve();
            }
          }

          /** @param {Error} err  */
          function handleError(err) {
            teardown();
            reject(err);
          }

          function setup() {
            child.on('message', handleMessage);
            child.on('error', handleError);
          }

          function teardown() {
            child.off('message', handleMessage);
            child.off('error', handleError);
          }

          setup();
        })
      );

      child.once('close', () => {
        this.child = null;
      });
    });

    compiler.hooks.entryOption.tap(this.constructor.name, (_context, entry) => {
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

/**
 * @param {Object} options
 * @param {NonNullable<webpack.Configuration['resolve']>['alias']} options.alias
 * @param {webpack.Configuration['cache']} options.cache
 * @param {string[]} [options.dependencies]
 * @param {string} [options.devtoolModuleFilenameTemplate]
 * @param {webpack.Configuration['entry']} options.entry
 * @param {webpack.Configuration['externals']} [options.externals]
 * @param {webpack.Configuration['externalsType']} [options.externalsType]
 * @param {boolean} [options.immutableAssets]
 * @param {'development' | 'production'} options.mode
 * @param {webpack.Configuration['name']} options.name
 * @param {webpack.Configuration['optimization']} [options.optimization]
 * @param {string} options.outputPath
 * @param {webpack.Configuration['plugins']} options.plugins
 * @param {string} options.publicOutputPath
 * @param {webpack.Configuration['stats']} options.stats
 * @param {import('@swc/core').Config} [options.swcLoaderOptions]
 * @param {'node' | 'webworker'} [options.target]
 *
 * @returns {webpack.Configuration}
 */
function makeConfig({
  alias,
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
  publicOutputPath,
  stats,
  swcLoaderOptions,
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
      clean: true,
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
      parser: {
        javascript: {
          exportsPresence: 'error',
        },
      },
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('swc-loader'),
          options: {
            ...swcLoaderOptions,
            jsc: {
              ...swcLoaderOptions?.jsc,
              parser: {
                ...swcLoaderOptions?.jsc?.parser,
                syntax: 'ecmascript',
              },
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: require.resolve('swc-loader'),
          options: {
            ...swcLoaderOptions,
            jsc: {
              ...swcLoaderOptions?.jsc,
              parser: {
                ...swcLoaderOptions?.jsc?.parser,
                syntax: 'typescript',
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: /** @type {Extract<webpack.RuleSetRule['use'], unknown[]>} */ (
            target == null ? [MiniCssExtractPlugin.loader] : []
          ).concat([
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
            {
              loader: require.resolve('lightningcss-loader'),
              options: { implementation: LightningCss },
            },
          ]),
        },
        { test: /\.(css|js)$/, use: require.resolve('source-map-loader') },
        {
          test: /\.(eot|gif|ico|jpe?g|otf|png|svg|ttf|webp|woff2?)$/,
          oneOf: [
            target === 'node' && {
              resourceQuery: '?file',
              dependency: 'url',
              type: 'asset/resource',
            },
            {
              type: 'asset',
              rules: [
                {
                  test: /\.svg$/,
                  generator: {
                    /**
                     * @param {string | Buffer} content
                     * @returns {string}
                     */
                    dataUrl: content => svgToMiniDataURI(content.toString()),
                  },
                },
                {
                  generator: {
                    outputPath: path.relative(outputPath, publicOutputPath),
                    publicPath: '/',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

/** @typedef {(entry: EntryItem) => string[]} MapEntryFn */

/**
 * @param {EntryItem} entry
 * @param {MapEntryFn} fn
 */
function mapEntryArrayOrString(entry, fn) {
  return Array.isArray(entry) ? fn(entry) : fn([entry]);
}

/**
 * @param {Record<string, EntryItem>} obj
 * @param {MapEntryFn} fn
 */
function mapObject(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );
}

/** @typedef {string | string[]} EntryItem */

/**
 * @param {EntryItem | Record<string, EntryItem>} entry
 * @param {MapEntryFn} fn
 */
function mapEntry(entry, fn) {
  if (Array.isArray(entry) || typeof entry === 'string') {
    return mapEntryArrayOrString(entry, fn);
  }

  return mapObject(entry, value => mapEntryArrayOrString(value, fn));
}

/**
 * @param {string} dirname
 * @returns {Generator<string, void, void>}
 */
function* directoriesUpwardsFrom(dirname) {
  let nextDirname = dirname;

  do {
    dirname = nextDirname;
    yield dirname;
    nextDirname = path.dirname(dirname);
  } while (nextDirname !== dirname);
}

/** @param {webpack.ExternalItemFunctionData} data */
async function nodeExternals({ context, request }) {
  if (!context || !request || !path.isAbsolute(context)) return false;

  if (request.startsWith('node:')) return true;

  for (const dirname of directoriesUpwardsFrom(path.normalize(context))) {
    const dependencies = await readFile(
      path.join(dirname, 'package.json'),
      'utf8',
    )
      .then(JSON.parse)
      .then(
        /** @param {unknown} pkgJson */
        pkgJson =>
          pkgJson &&
          typeof pkgJson === 'object' &&
          'dependencies' in pkgJson &&
          pkgJson.dependencies &&
          typeof pkgJson.dependencies === 'object'
            ? pkgJson.dependencies
            : undefined,
        () => undefined,
      );

    if (dependencies) {
      for (const key in dependencies) {
        if (request.startsWith(key)) return true;
      }
    }
  }

  return false;
}

/**
 * @typedef {Object} TargetSpec
 * @property {EntryItem | Record<string, EntryItem>} entry
 * @property {string} outputPath
 */

/**
 * @param {Object} options
 * @param {NonNullable<webpack.Configuration['resolve']>['alias']} [options.alias]
 * @param {boolean} [options.analyze]
 * @param {number} [options.analyzerPort]
 * @param {webpack.Configuration['cache']} [options.cache]
 * @param {Record<string, unknown>} [options.define]
 * @param {boolean} options.dev
 * @param {TargetSpec} options.node
 * @param {TargetSpec} [options.serviceWorker]
 * @param {TargetSpec} options.webPage
 * @param {webpack.WebpackPluginInstance[] | ((entryTarget: 'node' | 'serviceWorker' | 'webPage') => webpack.WebpackPluginInstance[])} [options.plugins]
 * @param {number} [options.port]
 * @param {boolean} [options.reactRefresh]
 * @param {boolean} [options.watch]
 *
 * @returns {webpack.Configuration[]}
 */
export default function makeWebpackConfig({
  alias,
  analyze,
  analyzerPort = 8001,
  cache,
  define,
  dev,
  node,
  plugins,
  port = 8000,
  reactRefresh,
  serviceWorker,
  watch,
  webPage,
}) {
  const env = dev ? 'development' : 'production';
  const stats = watch ? 'errors-warnings' : undefined;
  const assetsJsonPath = path.join(webPage.outputPath, 'assets.json');

  return [
    makeConfig({
      alias,
      cache,
      stats,
      mode: env,
      name: 'webPage',
      entry: mapEntry(webPage.entry, entryArray =>
        (watch && dev
          ? [
              require.resolve(
                '@faergeek/tiny-browser-hmr-webpack-plugin/client',
              ),
            ]
          : []
        ).concat(entryArray),
      ),
      outputPath: path.join(webPage.outputPath, 'public'),
      publicOutputPath: path.join(webPage.outputPath, 'public'),
      swcLoaderOptions: {
        jsc: {
          transform: {
            react: {
              refresh: watch && dev && reactRefresh,
            },
          },
        },
      },
      immutableAssets: true,
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('webPage'),
        }),
        makeAssetsPlugin(assetsJsonPath),
        new MiniCssExtractPlugin({
          filename: dev ? '[name].css' : '[name].[contenthash].css',
        }),
        process.stdout.isTTY && new webpack.ProgressPlugin(),
        analyze &&
          new BundleAnalyzerPlugin({
            analyzerHost: 'localhost',
            analyzerMode: watch ? 'server' : 'static',
            analyzerPort,
            defaultSizes: 'gzip',
            generateStatsFile: true,
            openAnalyzer: false,
            reportFilename: path.join(
              webPage.outputPath,
              'webpack-bundle-analyzer.html',
            ),
            statsFilename: path.join(webPage.outputPath, 'stats.json'),
          }),
        watch && dev && new webpack.HotModuleReplacementPlugin(),
        watch && dev && new TinyBrowserHmrWebpackPlugin({ port }),
        watch &&
          dev &&
          reactRefresh &&
          new ReactRefreshPlugin({ overlay: false }),
        ...(typeof plugins === 'function' ? plugins('webPage') : []),
      ],
      optimization: {
        minimizer: [
          '...',
          new LightningCssMinifyPlugin({ implementation: LightningCss }),
        ],
        runtimeChunk: true,
        splitChunks: { chunks: 'all' },
      },
    }),
    makeConfig({
      dependencies: ['webPage'],
      alias: { ...alias, 'assets.json': assetsJsonPath },
      cache,
      stats,
      mode: env,
      name: 'node',
      entry: node.entry,
      outputPath: node.outputPath,
      publicOutputPath: path.join(node.outputPath, 'public'),
      target: 'node',
      swcLoaderOptions: {
        env: {
          targets: 'current node',
        },
      },
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
      externals: nodeExternals,
      externalsType: 'commonjs',
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('node'),
        }),
        process.stdout.isTTY && new webpack.ProgressPlugin(),
        watch && new NodeHmrPlugin(path.join(node.outputPath, 'main.cjs')),
        ...(typeof plugins === 'function' ? plugins('node') : (plugins ?? [])),
      ],
    }),
    serviceWorker &&
      makeConfig({
        dependencies: ['webPage'],
        alias: { ...alias, 'assets.json': assetsJsonPath },
        cache,
        stats,
        mode: env,
        name: 'service-worker',
        entry: serviceWorker.entry,
        outputPath: path.join(serviceWorker.outputPath, 'public'),
        publicOutputPath: path.join(serviceWorker.outputPath, 'public'),
        target: 'webworker',
        plugins: [
          new webpack.DefinePlugin({
            ...define,
            __DEV__: JSON.stringify(dev),
            __ENTRY_TARGET__: JSON.stringify('serviceWorker'),
          }),
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          }),
          process.stdout.isTTY && new webpack.ProgressPlugin(),
          ...(typeof plugins === 'function' ? plugins('serviceWorker') : []),
        ],
      }),
  ].filter(n => !!n);
}
