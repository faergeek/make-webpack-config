const AssetsPlugin = require('assets-webpack-plugin');
const { spawn } = require('child_process');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { createServer } = require('http');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const path = require('path');
const { default: SseStream } = require('ssestream');
const { pipeline } = require('stream');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

class LaunchPlugin {
  constructor(filename) {
    this.child = null;
    this.path = filename;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap(this.constructor.name, () => {
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
  }
}

class ServerPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
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
    }).listen(this.port);

    compiler.hooks.afterEmit.tap(this.constructor.name, () => {
      streams.forEach(stream => {
        stream.write({ event: 'check', data: 'check' });
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
    plugins.push(new webpack.HotModuleReplacementPlugin());

    if (node) {
      plugins.push(new LaunchPlugin(path.join(paths.build, 'main.js')));
    } else {
      plugins.push(new ServerPlugin(port));

      if (dev) {
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

  function wrapEntry(entry) {
    return (
      node
        ? [
            'source-map-support/register',
            '@faergeek/make-webpack-config/node.hot',
            entry,
          ]
        : [`@faergeek/make-webpack-config/browser.hot?${port}`, entry]
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
      runtimeChunk: extractRuntimeChunk
        ? { name: entrypoint => `runtime-${entrypoint.name}` }
        : undefined,
      splitChunks: {
        cacheGroups: {
          hot: {
            test: /[\\/]node_modules[\\/](@faergeek[\\/]make-webpack-config[\\/](browser|node)\.hot\.js|mini-css-extract-plugin[\\/]dist[\\/]hmr[\\/])/,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: false,
            priority: 1,
            name: 'hot',
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
      deps: ['browser'],
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
