/* eslint-env node */
const { spawn } = require('child_process');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { mkdir, writeFile } = require('fs/promises');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

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
    ignoreWarnings: [/Failed to parse source map/],
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
      publicPath: target === 'browser' ? '/' : undefined,
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
          use: (target === 'browser'
            ? [MiniCssExtractPlugin.loader]
            : []
          ).concat([
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
          type: 'asset',
          generator: {
            dataUrl: content => svgToMiniDataURI(content.toString()),
          },
        },
        {
          test: /\.(png|gif|jpe?g|ico|eot|otf|ttf|woff2?)$/,
          type: 'asset/resource',
        },
      ],
    },
  };
}

async function makeWebpackConfig({
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

  const { default: escapeStringRegexp } = await import('escape-string-regexp');

  const { TinyBrowserHmrWebpackPlugin } = await import(
    '@faergeek/tiny-browser-hmr-webpack-plugin'
  );

  return [
    makeConfig({
      alias,
      cache,
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
          watch ? [new NodeHmrPlugin(path.join(paths.build, 'main.js'))] : []
        ),
    }),
    makeConfig({
      alias,
      cache,
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
                new webpack.HotModuleReplacementPlugin(),
                new TinyBrowserHmrWebpackPlugin({ port }),
                reactRefresh &&
                  new (require('@pmmmwh/react-refresh-webpack-plugin'))({
                    overlay: false,
                  }),
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
