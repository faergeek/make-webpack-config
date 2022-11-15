import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

import { TinyBrowserHmrWebpackPlugin } from '@faergeek/tiny-browser-hmr-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import escapeStringRegexp from 'escape-string-regexp';
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
        if (SIGNALS_ARE_SUPPORTED) {
          process.kill(this.child.pid, 'SIGUSR2');
        }
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
        entryValue.import.unshift(
          `@faergeek/make-webpack-config/hmr/node${
            SIGNALS_ARE_SUPPORTED ? '' : '?poll=1000'
          }`
        );
      });
    });
  }
}

function makeConfig({
  alias,
  babelLoaderOptions,
  cache,
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
    cache: cache && {
      type: 'filesystem',
      version: '4',
      buildDependencies: {
        config: [require.main.filename],
      },
    },
    output: {
      chunkFilename: filename,
      devtoolModuleFilenameTemplate,
      filename,
      hotUpdateChunkFilename: `[id].[fullhash].hot-update.${
        target === 'node' ? 'cjs' : 'js'
      }`,
      path: outputPath,
      publicPath: target === 'node' ? undefined : '/',
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
          test: /\.(js|tsx?)$/,
          include: srcPath,
          loader: require.resolve('babel-loader'),
          options: babelLoaderOptions,
        },
        {
          test: /\.css$/,
          use: (target !== 'node' ? [MiniCssExtractPlugin.loader] : []).concat([
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 2,
                modules: {
                  auto: true,
                  namedExport: true,
                  exportOnlyLocals: target === 'node',
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
              type: 'asset',
              generator: {
                dataUrl: content => svgToMiniDataURI(content.toString()),
                emit: target !== 'node',
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
              type: 'asset',
              generator: {
                emit: target !== 'node',
                publicPath: '/',
              },
            },
          ],
        },
      ],
    },
  };
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
  const pkg = require(path.relative(
    __dirname,
    path.resolve(process.cwd(), 'package.json')
  ));

  const env = dev ? 'development' : 'production';
  const stats = watch ? 'errors-warnings' : undefined;

  return [
    makeConfig({
      alias,
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
          watch ? [new NodeHmrPlugin(path.join(paths.build, 'main.cjs'))] : []
        ),
    }),
    makeConfig({
      alias,
      cache,
      stats,
      mode: env,
      name: 'browser',
      entry: (watch && dev
        ? ['@faergeek/tiny-browser-hmr-webpack-plugin/client']
        : []
      ).concat([entry.browser]),
      srcPath: paths.src,
      outputPath: paths.public,
      babelLoaderOptions: {
        envName: env,
        plugins: [watch && dev && reactRefresh && 'react-refresh/babel'].filter(
          Boolean
        ),
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
                  generateStatsFile: true,
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
                new webpack.HotModuleReplacementPlugin(),
                new TinyBrowserHmrWebpackPlugin({ port }),
                reactRefresh &&
                  new (require('@pmmmwh/react-refresh-webpack-plugin'))({
                    overlay: false,
                  }),
              ].filter(Boolean)
            : []
        ),
      optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
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
