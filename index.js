import { ChildProcess, fork } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';

import { TinyBrowserHmrWebpackPlugin } from '@faergeek/tiny-browser-hmr-webpack-plugin';
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

class AssetsPlugin {
  filename;

  /** @param {string} filename */
  constructor(filename) {
    this.filename = filename;
  }

  /** @param {Asset[]} assets */
  #groupAssetsByType(assets) {
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

  /** @param {webpack.Compiler} compiler */
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

      if (!assets) throw new Error('assets must be present');
      if (!publicPath) throw new Error('entrypoints must be present');

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

      /** @type {Set<Asset>} */
      const entriesAssets = new Set();

      if (!entrypoints) throw new Error('entrypoints must be present');

      const initial = Object.fromEntries(
        Object.values(entrypoints).map(entry => {
          if (!entry.assets || !entry.auxiliaryAssets || !entry.name) {
            throw new Error('assets, auxiliaryAssets and name must be present');
          }

          return [
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
          ];
        }),
      );

      const unnamedChunkAssets = new Set(dynamicAssets);

      if (!assetsByChunkName) {
        throw new Error('assetsByChunkName must be present');
      }

      const async = Object.fromEntries(
        Object.entries(assetsByChunkName)
          .map(
            /** @returns {[string, Asset[]]} */
            ([chunkName, chunkAssetNames]) => [
              chunkName,
              chunkAssetNames
                .map(assetName => index[assetName])
                .filter(asset => {
                  if (!asset || !unnamedChunkAssets.has(asset)) return false;

                  unnamedChunkAssets.delete(asset);

                  return true;
                }),
            ],
          )
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
 * @typedef {Object} Entry
 * @property {EntryItem | Record<string, EntryItem>} node
 * @property {EntryItem} [serviceWorker]
 * @property {EntryItem | Record<string, EntryItem>} webPage
 */

/**
 * @typedef {Object} Paths
 * @property {string} build
 * @property {string} public
 */

/**
 * @param {Object} options
 * @param {NonNullable<webpack.Configuration['resolve']>['alias']} [options.alias]
 * @param {boolean} [options.analyze]
 * @param {number} [options.analyzerPort]
 * @param {webpack.Configuration['cache']} [options.cache]
 * @param {Record<string, unknown>} [options.define]
 * @param {boolean} options.dev
 * @param {Entry} options.entry
 * @param {Paths} options.paths
 * @param {webpack.WebpackPluginInstance[] | ((entryTarget: 'node' | 'serviceWorker' | 'webPage') => webpack.WebpackPluginInstance[])} [options.plugins]
 * @param {number} [options.port]
 * @param {boolean} [options.reactRefresh]
 * @param {boolean} [options.watch]
 *
 * @returns {Promise<webpack.Configuration[]>}
 */
export default async function makeWebpackConfig({
  alias,
  analyze,
  analyzerPort = 8001,
  cache,
  define,
  dev,
  entry,
  paths,
  plugins,
  port = 8000,
  reactRefresh,
  watch,
}) {
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
      outputPath: paths.build,
      publicOutputPath: paths.public,
      target: 'node',
      swcLoaderOptions: {
        env: {
          targets: 'current node',
        },
      },
      devtoolModuleFilenameTemplate: path.relative(
        paths.build,
        '[resource-path]',
      ),
      externals: nodeExternals,
      externalsType: 'commonjs',
      plugins: /** @type {webpack.WebpackPluginInstance[]} */ ([
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('node'),
        }),
      ])
        .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
        .concat(
          watch ? [new NodeHmrPlugin(path.join(paths.build, 'main.cjs'))] : [],
        )
        .concat(
          typeof plugins === 'function' ? plugins('node') : (plugins ?? []),
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
      outputPath: paths.public,
      publicOutputPath: paths.public,
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
      plugins: /** @type {webpack.WebpackPluginInstance[]} */ ([
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
          __ENTRY_TARGET__: JSON.stringify('webPage'),
        }),
        new AssetsPlugin(path.join(paths.build, 'assets.json')),
        new MiniCssExtractPlugin({
          filename: dev ? '[name].css' : '[name].[contenthash].css',
        }),
      ])
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
        )
        .concat(typeof plugins === 'function' ? plugins('webPage') : []),
      optimization: {
        minimizer: [
          '...',
          new LightningCssMinifyPlugin({ implementation: LightningCss }),
        ],
        runtimeChunk: true,
        splitChunks: { chunks: 'all' },
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
        outputPath: paths.public,
        publicOutputPath: paths.public,
        target: 'webworker',
        plugins: /** @type {webpack.WebpackPluginInstance[]} */ ([
          new webpack.DefinePlugin({
            ...define,
            __DEV__: JSON.stringify(dev),
            __ENTRY_TARGET__: JSON.stringify('serviceWorker'),
          }),
          new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          }),
        ])
          .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
          .concat(
            typeof plugins === 'function' ? plugins('serviceWorker') : [],
          ),
      }),
  ].filter(n => !!n);
}
