# Changelog

All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

## 24.0.3 (2025-09-09)

### Documentation

- clean up readme

## 24.0.2 (2025-09-08)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.2.2

## 24.0.1 (2025-09-08)

### Fixes

- move `onlyBuiltDependencies` to `pnpm-workspace.yaml`
- turn `package.json#repository` into an object

## 24.0.0 (2025-08-30)

### BREAKING CHANGES

- transpiling files inside of `node_modules` nested
  inside `paths.src` won't work anymore.

### Fixes

- get rid of `paths.src` option
- properly externalize `dependencies` for nested packages

## 23.3.2 (2025-08-24)

### Fixes

- update dependency @swc/core to v1.13.5

## 23.3.1 (2025-08-21)

### Fixes

- update dependency @swc/core to v1.13.4

## 23.3.0 (2025-08-16)

### Features

- allow passing a function to `plugins` option

### Fixes

- improve types

## 23.2.8 (2025-08-12)

### Fixes

- update dependency mini-css-extract-plugin to v2.9.4

## 23.2.7 (2025-08-09)

### Fixes

- downgrade `@types/node` peer dep to `^22.17.1`

## 23.2.6 (2025-08-05)

### Fixes

- update dependency mini-css-extract-plugin to v2.9.3

## 23.2.5 (2025-07-29)

### Fixes

- update dependency @swc/core to v1.13.3

## 23.2.4 (2025-07-29)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.2.0

## 23.2.3 (2025-07-23)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.1.2

## 23.2.2 (2025-07-23)

### Fixes

- add `@types/node` to `peerDependencies`
- downgrade and move `utf-8-validate` to `optionalDependencies`

## 23.2.1 (2025-07-23)

### Fixes

- update dependency @swc/core to v1.13.2

## 23.2.0 (2025-07-22)

### Features

- allow adding webpack plugins

## 23.1.1 (2025-07-20)

### Fixes

- `strictExportPresence` -> `parser.javascript.exportsPresence`

## 23.1.0 (2025-07-20)

### Features

- add types

## 23.0.3 (2025-07-20)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.1.0

## 23.0.2 (2025-07-20)

### Fixes

- update dependency @swc/core to v1.13.1

## 23.0.1 (2025-07-19)

### Fixes

- update dependency utf-8-validate to v6

## 23.0.0 (2025-07-18)

### BREAKING CHANGES

- module resolution analogous to `"baseUrl":
"<paths.src>"` in `tsconfig.json` will not work anymore

- support for postcss has been dropped, postcss
  configuration has no effect anymore.

- support for babel has been dropped, babel configuration
  has no effect anymore.

### Fixes

- install `utf-8-validate` to satisfy peer dependency

### Performance Improvements

- don't add `paths.src` to `resolve.modules`
- use `lightningcss-loader` for syntax lowering and minification
- replace `babel-loader` with `swc-loader`

## 22.0.103 (2025-06-26)

### Fixes

- update dependency browserslist to v4.25.1

## 22.0.102 (2025-06-26)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.6.1

## 22.0.101 (2025-05-29)

### Fixes

- update dependency browserslist to v4.25.0

## 22.0.100 (2025-05-14)

### Fixes

- update dependency lightningcss to v1.30.1

## 22.0.99 (2025-05-11)

### Fixes

- update dependency lightningcss to v1.30.0

## 22.0.98 (2025-05-04)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.17

## 22.0.97 (2025-04-29)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to ^0.6.0

## 22.0.96 (2025-03-31)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.16

## 22.0.95 (2025-03-29)

### Fixes

- update dependency react-refresh to v0.17.0

## 22.0.94 (2025-03-15)

### Fixes

- update dependency lightningcss to v1.29.3

## 22.0.93 (2025-03-07)

### Fixes

- update dependency css-minimizer-webpack-plugin to v7.0.2

## 22.0.92 (2025-03-06)

### Fixes

- update dependency css-minimizer-webpack-plugin to v7.0.1

## 22.0.91 (2025-03-06)

### Fixes

- update dependency lightningcss to v1.29.2

## 22.0.90 (2025-02-28)

### Fixes

- update dependency babel-loader to v10

## 22.0.89 (2025-02-22)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.16

## 22.0.88 (2025-01-10)

### Fixes

- update dependency lightningcss to v1.29.1

## 22.0.87 (2025-01-10)

### Fixes

- update dependency lightningcss to v1.29.0

## 22.0.86 (2025-01-08)

### Fixes

- update dependency browserslist to v4.24.4

## 22.0.85 (2024-12-14)

### Fixes

- update dependency browserslist to v4.24.3

## 22.0.84 (2024-12-07)

### Fixes

- update dependency react-refresh to v0.16.0

## 22.0.83 (2024-11-26)

### Fixes

- update dependency lightningcss to v1.28.2

## 22.0.82 (2024-11-04)

### Fixes

- update dependency lightningcss to v1.28.0

## 22.0.81 (2024-11-01)

### Fixes

- update dependency mini-css-extract-plugin to v2.9.2

## 22.0.80 (2024-10-22)

### Fixes

- update dependency browserslist to v4.24.2

## 22.0.79 (2024-09-25)

### Fixes

- update dependency browserslist to v4.24.0

## 22.0.78 (2024-09-17)

### Fixes

- update dependency babel-loader to v9.2.1

## 22.0.77 (2024-09-11)

### Fixes

- update dependency lightningcss to v1.27.0

## 22.0.76 (2024-08-20)

### Fixes

- update dependency mini-css-extract-plugin to v2.9.1

## 22.0.75 (2024-08-09)

### Fixes

- update dependency lightningcss to v1.26.0

## 22.0.74 (2024-08-02)

### Fixes

- update dependency browserslist to v4.23.3

## 22.0.73 (2024-07-10)

### Fixes

- update dependency browserslist to v4.23.2

## 22.0.72 (2024-07-04)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.15

## 22.0.71 (2024-06-17)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.14

## 22.0.70 (2024-06-09)

### Fixes

- update dependency browserslist to v4.23.1

## 22.0.69 (2024-06-03)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.15

## 22.0.68 (2024-06-02)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.14

## 22.0.67 (2024-05-25)

### Fixes

- update dependency lightningcss to v1.25.1

## 22.0.66 (2024-05-23)

### Fixes

- update dependency css-loader to v7.1.2

## 22.0.65 (2024-05-18)

### Fixes

- update dependency lightningcss to v1.25.0

## 22.0.64 (2024-05-07)

### Fixes

- update dependency css-minimizer-webpack-plugin to v7

## 22.0.63 (2024-04-28)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.13

## 22.0.62 (2024-04-28)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.13

## 22.0.61 (2024-04-27)

### Fixes

- update dependency react-refresh to v0.14.2

## 22.0.60 (2024-04-26)

### Fixes

- update dependency react-refresh to v0.14.1

## 22.0.59 (2024-04-17)

### Fixes

- update dependency mini-css-extract-plugin to v2.9.0

## 22.0.58 (2024-04-12)

### Fixes

- update dependency webpack-bundle-analyzer to v4.10.2

## 22.0.57 (2024-04-11)

### Fixes

- update dependency css-loader to v7.1.1

## 22.0.56 (2024-04-09)

### Fixes

- update dependency css-loader to v7.1.0

## 22.0.55 (2024-04-05)

### Fixes

- update dependency css-loader to v7

## 22.0.54 (2024-04-04)

### Fixes

- update dependency css-loader to v6.11.0

## 22.0.53 (2024-03-16)

### Fixes

- update dependency lightningcss to v1.24.1

## 22.0.52 (2024-02-29)

### Fixes

- update dependency postcss-loader to v8.1.1

## 22.0.51 (2024-02-28)

### Fixes

- update dependency mini-css-extract-plugin to v2.8.1

## 22.0.50 (2024-02-16)

### Fixes

- bump browserslist from 4.22.3 to 4.23.0

## 22.0.49 (2024-01-20)

### Fixes

- properly resolve path to added entry
- don't disable symlinks

## 22.0.48 (2024-01-18)

### Fixes

- update dependency css-loader to v6.9.1

## 22.0.47 (2024-01-17)

### Fixes

- update dependency css-minimizer-webpack-plugin to v6

## 22.0.46 (2024-01-16)

### Fixes

- update dependency postcss-loader to v8

## 22.0.45 (2024-01-15)

### Fixes

- update dependency source-map-loader to v5

## 22.0.44 (2024-01-15)

### Fixes

- update dependency lightningcss to v1.23.0

## 22.0.43 (2024-01-11)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.7

## 22.0.42 (2024-01-09)

### Fixes

- update dependency css-loader to v6.9.0

## 22.0.41 (2023-12-27)

### Fixes

- update dependency source-map-loader to v4.0.2
- update dependency postcss-loader to v7.3.4

## 22.0.40 (2023-12-27)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.12

## 22.0.39 (2023-12-14)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.11

## 22.0.38 (2023-12-14)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.10

## 22.0.37 (2023-12-05)

### Fixes

- update dependency browserslist to v4.22.2

## 22.0.36 (2023-11-19)

### Fixes

- update dependency webpack-bundle-analyzer to v4.10.1

## 22.0.35 (2023-11-15)

### Fixes

- update dependency webpack-bundle-analyzer to v4.10.0

## 22.0.34 (2023-11-09)

### Fixes

- update dependency lightningcss to v1.22.1

## 22.0.33 (2023-09-30)

### Fixes

- update dependency browserslist to v4.22.1

## 22.0.32 (2023-09-22)

### Fixes

- update dependency browserslist to v4.21.11

## 22.0.31 (2023-09-20)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.9

## 22.0.30 (2023-09-18)

### Fixes

- update dependency lightningcss to v1.22.0

## 22.0.29 (2023-09-11)

### Fixes

- update dependency lightningcss to v1.21.8

## 22.0.28 (2023-09-09)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.8

## 22.0.27 (2023-09-07)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.7

## 22.0.26 (2023-08-31)

### Fixes

- update dependency webpack-bundle-analyzer to v4.9.1

## 22.0.25 (2023-08-20)

### Fixes

- update dependency lightningcss to v1.21.6

## 22.0.24 (2023-08-15)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.11

## 22.0.23 (2023-07-31)

### Fixes

- update dependency browserslist to v4.21.10

## 22.0.22 (2023-07-08)

### Fixes

- update dependency babel-loader to v9.1.3

## 22.0.21 (2023-07-05)

### Fixes

- update dependency lightningcss to v1.21.5

## 22.0.20 (2023-07-04)

### Fixes

- update dependency lightningcss to v1.21.4

## 22.0.19 (2023-07-03)

### Fixes

- update dependency lightningcss to v1.21.3

## 22.0.18 (2023-07-02)

### Fixes

- update dependency lightningcss to v1.21.2

## 22.0.17 (2023-06-25)

### Fixes

- update dependency lightningcss to v1.21.1

## 22.0.16 (2023-06-16)

### Fixes

- update dependency browserslist to v4.21.9

## 22.0.15 (2023-06-15)

### Fixes

- update dependency postcss-loader to v7.3.3

## 22.0.14 (2023-06-14)

### Fixes

- update dependency css-minimizer-webpack-plugin to v5.0.1

## 22.0.13 (2023-06-14)

### Fixes

- update dependency browserslist to v4.21.8

## 22.0.12 (2023-06-07)

### Fixes

- update dependency lightningcss to v1.21.0

## 22.0.11 (2023-06-02)

### Fixes

- update dependency webpack-bundle-analyzer to v4.9.0

## 22.0.10 (2023-05-29)

### Fixes

- update dependency browserslist to v4.21.7

## 22.0.9 (2023-05-28)

### Fixes

- update dependency browserslist to v4.21.6

## 22.0.8 (2023-05-28)

### Fixes

- update dependency postcss-loader to v7.3.2
- update dependency css-loader to v6.8.1

## 22.0.7 (2023-05-28)

### Fixes

- update dependency css-loader to v6.8.0

## 22.0.6 (2023-05-26)

### Fixes

- update dependency postcss-loader to v7.3.1

## 22.0.5 (2023-05-25)

### Fixes

- make lightningcss aware of browserslist

## 22.0.4 (2023-05-19)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.6

## 22.0.3 (2023-05-19)

### Fixes

- update dependency css-loader to v6.7.4

## 22.0.2 (2023-04-29)

### Fixes

- update dependency postcss-loader to v7.3.0

## 22.0.1 (2023-04-20)

### Fixes

- update dependency lightningcss to v1.20.0

## 22.0.0 (2023-04-17)

### BREAKING CHANGES

- entry.browser renamed to entry.webPage
- `__NODE__` boolean global is replaced by
  **ENTRY_TARGET** enum-like global with possible values being
  `'webPage'`, `'node'`, or `'serviceWorker'`.

- assets.json file format has changed to contain both
  initial and async chunks assets along with an immutable flag. This
  allows caching all assets on service worker install, so implementing
  offline support is much more straightforward now.

### Features

- allow using object as a browser entry
- allow to differentiate between webPage/node/serviceWorker
- add info about async chunks to assets.json

### Fixes

- forbid splitting service worker into multiple chunks
- improve per-target configs

## 21.1.24 (2023-04-04)

### Fixes

- update dependency postcss-loader to v7.2.4

## 21.1.23 (2023-04-04)

### Fixes

- update dependency postcss-loader to v7.2.3

## 21.1.22 (2023-04-04)

### Fixes

- update dependency postcss-loader to v7.2.1

## 21.1.21 (2023-03-28)

### Fixes

- update dependency css-minimizer-webpack-plugin to v5

## 21.1.20 (2023-03-17)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.5

## 21.1.19 (2023-03-16)

### Fixes

- update dependency postcss-loader to v7.1.0
- update dependency mini-css-extract-plugin to v2.7.4

## 21.1.18 (2023-03-13)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.6

## 21.1.17 (2023-03-08)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.3

## 21.1.16 (2023-02-14)

### Fixes

- update dependency lightningcss to v1.19.0

## 21.1.15 (2023-02-14)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.5

## 21.1.14 (2023-02-13)

### Fixes

- update dependency webpack-bundle-analyzer to v4.8.0

## 21.1.13 (2023-01-08)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.4

## 21.1.12 (2023-01-05)

### Fixes

- update dependency lightningcss to v1.18.0

## 21.1.11 (2023-01-05)

### Fixes

- update dependency babel-loader to v9.1.2

## 21.1.10 (2022-12-28)

### Fixes

- allow passing an array as a browser entry

## 21.1.9 (2022-12-14)

### Fixes

- update dependency css-loader to v6.7.3

## 21.1.8 (2022-12-06)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.2

## 21.1.7 (2022-11-30)

### Fixes

- update dependency lightningcss to v1.17.1

## 21.1.6 (2022-11-30)

### Fixes

- update dependency postcss-loader to v7.0.2

## 21.1.5 (2022-11-30)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.1

## 21.1.4 (2022-11-29)

### Fixes

- update dependency lightningcss to v1.17.0

## 21.1.3 (2022-11-24)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.10

## 21.1.2 (2022-11-22)

### Fixes

- revert relative urls in js

## 21.1.1 (2022-11-20)

### Fixes

- bring back hashes to css in dev, so HMR works

## 21.1.0 (2022-11-20)

### Features

- expose assets.json alias to simplify typing

## 21.0.1 (2022-11-20)

### Fixes

- always add hashes to filenames

## 21.0.0 (2022-11-20)

### BREAKING CHANGES

- you need to update path from which you read/import
  assets.json

### Features

- make node and sw configs depend on browser

### Fixes

- don't use mini-css-extract-plugin for sw
- move assets.json back out of public folder

## 20.2.0 (2022-11-20)

### Features

- add support for service worker entry

### Performance Improvements

- disable iife for node and webworker targets

## 20.1.0 (2022-11-20)

### Features

- output relative urls in js

### Fixes

- disable css cache group

## 20.0.0 (2022-11-19)

### BREAKING CHANGES

- webpack-assets.json is moved to public folder and renamed to assets.json

- now you have to specify full cache configuration as a
  cache option, instead of just boolean.

### Features

- rename assets json and make it public
- accept full cache config as an option

## 19.1.0 (2022-11-19)

### Features

- add auxiliary assets to webpack-assets.json

## 19.0.6 (2022-11-19)

### Performance Improvements

- revert using esbuild to minify js

## 19.0.5 (2022-11-19)

### Fixes

- move lightningcss to dependencies

## 19.0.4 (2022-11-19)

### Performance Improvements

- use esbuild to minify js

## 19.0.3 (2022-11-19)

### Performance Improvements

- use lightningcss for css minification

## 19.0.2 (2022-11-16)

### Fixes

- update dependency mini-css-extract-plugin to v2.7.0

## 19.0.1 (2022-11-15)

### Fixes

- require explicit `?inline` to inline assets

## 19.0.0 (2022-11-15)

### BREAKING CHANGES

- if you want to use absolute path in node, you need to
  add `?absolute` query to `import` or `new URL(...)`.

### Features

- better handle assets for node target

## 18.1.1 (2022-11-13)

### Fixes

- use .cjs ext for node hot update chunks

## 18.1.0 (2022-11-13)

### Features

- generate stats file for bundle analysis

## 18.0.1 (2022-11-13)

### Fixes

- use .cjs extension for now target

## 18.0.0-beta.1 (2022-11-13)

### BREAKING CHANGES

- there's no extractRuntimeChunk option anymore

- from now on, you have to use a dynamic import, if you
  want to use it from commonjs

### Features

- always use single runtime chunk
- output more info when not in watch mode
- convert to es module

### Fixes

- disable default cache groups

## 17.1.2 (2022-11-12)

### Fixes

- don't disable experimentalUseImportModule

## 17.1.1 (2022-11-12)

### Fixes

- browser target condition

## 17.1.0 (2022-11-12)

### Features

- emit assets for node target

## 16.1.12 (2022-11-12)

### Fixes

- ignore source-map-loader warnings

## 16.1.11 (2022-11-10)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.9

## 16.1.10 (2022-11-10)

### Fixes

- update dependency sass-loader to v13.2.0

## 16.1.9 (2022-11-09)

### Fixes

- update dependency node-sass to v8

## 16.1.8 (2022-11-08)

### Fixes

- disable react-refresh overlay

## 16.1.7 (2022-11-07)

### Fixes

- update dependency @faergeek/tiny-browser-hmr-webpack-plugin to v1.0.3

## 16.1.6 (2022-11-03)

### Fixes

- update dependency babel-loader to v9.1.0

## 16.1.5 (2022-10-31)

### Fixes

- update dependency babel-loader to v9.0.1

## 16.1.4 (2022-10-31)

### Fixes

- use tiny-browser-hmr-webpack-plugin

## 16.1.3 (2022-10-27)

### Fixes

- update dependency babel-loader to v9

## 16.1.2 (2022-10-26)

### Fixes

- update dependency webpack-bundle-analyzer to v4.7.0

## 16.1.1 (2022-10-21)

### Fixes

- update dependency @prefresh/babel-plugin to v0.4.4

## 16.1.0 (2022-10-15)

### Features

- use polling on windows

## 16.0.63 (2022-10-14)

### Fixes

- update dependency css-minimizer-webpack-plugin to v4.2.2

## 16.0.62 (2022-10-10)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.8

## 16.0.61 (2022-10-09)

### Fixes

- update dependency css-minimizer-webpack-plugin to v4.2.1

## 16.0.60 (2022-10-09)

### Fixes

- update dependency source-map-loader to v4.0.1

## 16.0.59 (2022-10-07)

### Fixes

- update dependency sass-loader to v13.1.0

## 16.0.58 (2022-09-30)

### Fixes

- update dependency css-minimizer-webpack-plugin to v4.2.0

## 16.0.57 (2022-09-12)

### Fixes

- update dependency css-minimizer-webpack-plugin to v4.1.0

## 16.0.56 (2022-09-09)

### Fixes

- update dependency node-sass to v7.0.3

## 16.0.55 (2022-09-08)

### Fixes

- update dependency node-sass to v7.0.2

## 16.0.54 (2022-08-22)

### Fixes

- update dependency webpack-bundle-analyzer to v4.6.1

## 16.0.53 (2022-08-19)

### Fixes

- update dependency webpack-bundle-analyzer to v4.6.0

## 16.0.52 (2022-07-12)

### Fixes

- update dependency postcss-loader to v7.0.1

## 16.0.51 (2022-06-29)

### Fixes

- update dependency @prefresh/webpack to v3.3.4

## 16.0.50 (2022-06-28)

### Fixes

- update dependency sass-loader to v13.0.2

## 16.0.49 (2022-06-24)

### Fixes

- update dependency sass-loader to v13.0.1

## 16.0.48 (2022-06-16)

### Fixes

- update dependency mini-css-extract-plugin to v2.6.1

## 16.0.47 (2022-06-15)

### Fixes

- update dependency react-refresh to v0.14.0

## 16.0.46 (2022-06-14)

### Fixes

- update dependency source-map-loader to v4

## 16.0.45 (2022-05-23)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.7

## 16.0.44 (2022-05-19)

### Fixes

- update dependency css-minimizer-webpack-plugin to v4

## 16.0.43 (2022-05-19)

### Fixes

- update dependency sass-loader to v13

## 16.0.42 (2022-05-19)

### Fixes

- update dependency postcss-loader to v7

## 16.0.41 (2022-05-11)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.6

## 16.0.40 (2022-04-27)

### Fixes

- update dependency react-refresh to v0.13.0

## 16.0.39 (2022-04-20)

### Fixes

- update dependency babel-loader to v8.2.5

## 16.0.38 (2022-04-06)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.5

## 16.0.37 (2022-03-30)

### Fixes

- update dependency react-refresh to v0.12.0

## 16.0.36 (2022-03-23)

### Fixes

- update dependency babel-loader to v8.2.4

## 16.0.35 (2022-03-14)

### Fixes

- update dependency mini-css-extract-plugin to v2.6.0

## 16.0.34 (2022-03-14)

### Fixes

- update dependency mini-svg-data-uri to v1.4.4

## 16.0.33 (2022-03-14)

### Fixes

- update dependency css-loader to v6.7.1

## 16.0.32 (2022-02-21)

### Fixes

- update dependency @prefresh/babel-plugin to v0.4.3

## 16.0.31 (2022-02-21)

### Fixes

- update dependency @prefresh/webpack to v3.3.3

## 16.0.30 (2022-02-15)

### Fixes

- update dependency sass-loader to v12.6.0

## 16.0.29 (2022-02-15)

### Fixes

- update dependency sass-loader to v12.5.0

## 16.0.28 (2022-02-02)

### Fixes

- update dependency css-loader to v6.6.0

## 16.0.27 (2022-01-25)

### Fixes

- update dependency mini-css-extract-plugin to v2.5.3

## 16.0.26 (2022-01-18)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.4.1

## 16.0.25 (2022-01-18)

### Fixes

- update dependency mini-css-extract-plugin to v2.5.2

## 16.0.24 (2022-01-18)

### Fixes

- update dependency resolve-url-loader to v5

## 16.0.23 (2022-01-17)

### Fixes

- update dependency mini-css-extract-plugin to v2.5.1

## 16.0.22 (2022-01-17)

### Fixes

- update dependency mini-css-extract-plugin to v2.5.0

## 16.0.21 (2022-01-14)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.7

## 16.0.20 (2022-01-10)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.6

## 16.0.19 (2022-01-10)

### Fixes

- update dependency source-map-loader to v3.0.1

## 16.0.18 (2021-12-29)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.4

## 16.0.17 (2021-12-29)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.3.1

## 16.0.16 (2021-12-27)

### Fixes

- update dependency node-sass to v7.0.1

## 16.0.15 (2021-12-20)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.3.0

## 16.0.13 (2021-12-09)

### Fixes

- update dependency node-sass to v7

## 16.0.12 (2021-12-09)

### Fixes

- update dependency sass-loader to v12.4.0

## 16.0.11 (2021-11-29)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.3

## 16.0.10 (2021-11-29)

### Fixes

- update dependency postcss-loader to v6.2.1

## 16.0.9 (2021-11-24)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.2.0

## 16.0.8 (2021-11-20)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to v0.5.2

## 16.0.7 (2021-11-20)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.5

## 16.0.6 (2021-11-20)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.1.4

## 16.0.5 (2021-11-18)

### Fixes

- update dependency react-refresh to v0.11.0

## 16.0.4 (2021-11-16)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.1.3

## 16.0.3 (2021-11-16)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.4

## 16.0.2 (2021-11-08)

### Fixes

- update dependency css-loader to v6.5.1

## 16.0.1 (2021-10-28)

### Fixes

- update dependency sass-loader to v12.3.0

## 16.0.0 (2021-10-27)

### BREAKING CHANGES

- mdx is no longer supported

### Fixes

- remove @mdx-js/loader

## 15.0.20-beta.1 (2021-10-27)

### Fixes

- update escape-string-regexp to v5

## 15.0.19 (2021-10-27)

### Fixes

- explicitly set localIdentName default value

## 15.0.18-beta.1 (2021-10-27)

### Fixes

- remove upper limit for webpack peer dep

## 15.0.17 (2021-10-27)

### Fixes

- update dependency mini-svg-data-uri to v1.4.3

## 15.0.16 (2021-10-27)

### Fixes

- update dependency css-loader to v6

## 15.0.15 (2021-10-27)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.3

## 15.0.14 (2021-10-25)

### Fixes

- update dependency babel-loader to v8.2.3

## 15.0.13 (2021-10-15)

### Fixes

- update dependency postcss-loader to v6.2.0

## 15.0.12 (2021-10-13)

### Fixes

- update dependency webpack-bundle-analyzer to v4.5.0

## 15.0.11 (2021-10-13)

### Fixes

- update dependency sass-loader to v12.2.0

## 15.0.10 (2021-10-07)

### Fixes

- limit webpack peer dependency version

## 15.0.7 (2021-10-07)

### Fixes

- update dependency css-loader to v6

## 15.0.6 (2021-10-07)

### Fixes

- update dependency @pmmmwh/react-refresh-webpack-plugin to ^0.5.0

## 15.0.5 (2021-10-07)

### Fixes

- update dependency mini-css-extract-plugin to v2.4.1

## 15.0.4 (2021-10-06)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.1.1

## 15.0.3 (2021-10-05)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.1.0

## 15.0.2 (2021-09-20)

### Fixes

- update dependency mini-css-extract-plugin to v2.3.0

## 15.0.1 (2021-08-06)

### Fixes

- update dependency mini-css-extract-plugin to v2.2.0

## 15.0.0 (2021-07-17)

### BREAKING CHANGES

- you should pass --enable-source-maps flag yourself when
  you run built bundle using node. In development it's passed
  automatically.

### Fixes

- don't use source-map-support package

## 14.2.3 (2021-07-14)

### Fixes

- update dependency css-loader to v5.2.7

## 14.2.1 (2021-07-07)

### Fixes

- update dependency @prefresh/webpack to v3.3.2

## 14.2.0-beta.1 (2021-07-07)

### Features

- add linaria

## 14.1.13 (2021-07-05)

### Fixes

- update dependency mini-css-extract-plugin to v2.1.0

## 14.1.12 (2021-07-04)

### Fixes

- don't accidentally put false to plugins array (2)

## 14.1.11 (2021-07-04)

### Fixes

- don't accidentally put false to plugins array

## 14.1.10 (2021-07-04)

### Fixes

- don't specify target in browser config

## 14.1.9 (2021-07-04)

### Fixes

- specify 'current node' as a target for babel

## 14.1.8 (2021-07-03)

### Performance Improvements

- generate assets json using custom plugin

## 14.1.7 (2021-07-02)

### Fixes

- make not exact import paths external as well

## 14.1.6 (2021-07-02)

### Fixes

- don't set watch as it depends on the caller

## 14.1.5 (2021-07-02)

### Fixes

- explicitly set mode and watch options

## 14.1.4 (2021-07-02)

### Fixes

- update dependency mini-css-extract-plugin to v2

## 14.1.3 (2021-07-02)

### Fixes

- update dependency mini-css-extract-plugin to v1.6.2

## 14.1.2 (2021-07-01)

### Fixes

- update dependency postcss-loader to v6.1.1

## 14.1.1 (2021-07-01)

### Fixes

- enable module.strictExportPresence

## 14.1.0 (2021-07-01)

### Features

- add .mdx support

## 14.0.8 (2021-06-27)

### Fixes

- add hmr folder to files

## 14.0.7 (2021-06-27)

### Fixes

- check hash and wait until idle before check

## 14.0.6 (2021-06-27)

### Performance Improvements

- remove dependency between configs

## 14.0.5 (2021-06-27)

### Performance Improvements

- disable HMR for browser in production watch

## 14.0.4 (2021-06-27)

### Fixes

- don't generate runtime chunks for node

## 14.0.3 (2021-06-27)

### Performance Improvements

- include hot entries in watch mode only

## 14.0.2 (2021-06-27)

### Performance Improvements

- always split chunks

## 14.0.0 (2021-06-27)

### BREAKING CHANGES

- react-refresh and @preact/refresh are not disabled
  in production anymore. You should decide to enable them or not

### Features

- enable refresh plugins in prod watch too

## 13.2.0 (2021-06-27)

### Features

- enable refresh plugins in prod watch too

### Performance Improvements

- add hot cache group

## 13.1.1 (2021-06-26)

### Performance Improvements

- use builtin progress plugin

## 13.1.0 (2021-06-26)

### Features

- color progress bars differently

## 13.0.2 (2021-06-26)

### Fixes

- don't silence warnings during development

## 13.0.1 (2021-06-26)

### Fixes

- trigger release

## 13.0.0 (2021-06-26)

### BREAKING CHANGES

- static assets are not served in development anymore,
  you should serve them yourself. And they should not be cached based on
  filename.

### Performance Improvements

- simplify HMR for the browser bundle

## 12.0.11 (2021-06-26)

### Fixes

- update dependency mini-css-extract-plugin to v1.6.1

## 12.0.10 (2021-06-26)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.0.2

## 12.0.9 (2021-06-24)

### Fixes

- update dependency node-sass to v6.0.1

## 12.0.8 (2021-06-21)

### Documentation

- point to js-webapp-template for usage

### Fixes

- try to release again

## 12.0.7 (2021-06-21)

### Fixes

- avoid crash on launched process crash
- make webpack-plugin-serve silent
- set stats to errors-only in watch mode

## 12.0.6 (2021-06-20)

### Performance Improvements

- write tiny plugin to launch built server

## 12.0.5 (2021-06-20)

### Fixes

- make node config always depend on browser one

## 12.0.4 (2021-06-20)

### Fixes

- bump cache version

## 12.0.3 (2021-06-20)

### Fixes

- make server crash on unaccepted module update

## 12.0.2 (2021-06-19)

### Fixes

- set default bundle analyzer port to 8001

## 12.0.0 (2021-06-16)

### BREAKING CHANGES

- you now have to explicitly enable analyzer. To preserve
  the old behavior set analyzer option to the value opposite to dev

### Features

- add analyzerPort option
- add analyzer option

## 11.2.0 (2021-06-16)

### Features

- enable HMR in watch mode for browser

## 11.1.6 (2021-06-16)

### Fixes

- set progress to minimal for simplest feedback

## 11.1.5 (2021-06-14)

### Fixes

- update dependency react-refresh to v0.10.0

## 11.1.4 (2021-06-14)

### Fixes

- update dependency sass-loader to v12.1.0

## 11.1.3 (2021-06-14)

### Fixes

- update dependency postcss-loader to v6

## 11.1.2 (2021-06-14)

### Fixes

- make webpack-plugin-serve client silent

## 11.1.1 (2021-06-14)

### Fixes

- define dependencies if not in watch mode

## 11.1.0 (2021-06-14)

### Features

- add cache option

## 11.0.10 (2021-06-14)

### Fixes

- disable webpack-plugin-serve client retries
- don't tweak webpack-plugin-serve logging
- don't define dependencies between configs

### Performance Improvements

- don't generate extra chunks in dev

## 11.0.9 (2021-06-14)

### Performance Improvements

- don't use webpack-bundle-analyzer in dev

## 11.0.8 (2021-06-13)

### Fixes

- set stats path so it doesn't end up in public

## 11.0.7 (2021-06-13)

### Fixes

- make webpack-bundle-analyzer more useful

## 11.0.6 (2021-06-13)

### Fixes

- asset/source -> asset/resource

## 11.0.5 (2021-06-13)

### Performance Improvements

- do not inline binary assets

## 11.0.4 (2021-06-09)

### Performance Improvements

- inline svgs using mini-svg-data-uri

## 11.0.3 (2021-06-09)

### Performance Improvements

- use asset modules for assets

## 11.0.2 (2021-06-07)

### Fixes

- handle .ico with file-loader

## 11.0.1 (2021-06-07)

### Fixes

- remove friendly-errors-webpack-plugin

## 11.0.0 (2021-06-07)

### BREAKING CHANGES

- you must change default imports to namespace imports
  like this:

### Performance Improvements

- use named exports for css

## 10.1.1 (2021-06-07)

### Performance Improvements

- disable progress indicator in browser

## 10.1.0 (2021-06-07)

### Features

- add port option

## 10.0.1 (2021-06-05)

### Documentation

- remove nodeExternals from readme

### Fixes

- handle .otf with url-loader

## 10.0.0 (2021-06-05)

### BREAKING CHANGES

- nodeExternals option is removed

### Documentation

- fix option name in README.md

### Fixes

- extract node externals from consumer deps

## 9.0.1 (2021-06-05)

### Fixes

- remove webpack-node-externals

## 9.0.0 (2021-06-05)

### BREAKING CHANGES

- externals are no longer configured by default, to
  preserve the old behavior, copy nodeExternals example from README.md

### Features

- add nodeExternals option

## 8.0.1 (2021-06-05)

### Fixes

- make sure aliases work in node

## 8.0.0 (2021-06-03)

### BREAKING CHANGES

- you need to enable extractRuntimeChunk option to
  preserve the old behavior

### Documentation

- add prefresh option to readme example

### Performance Improvements

- don't extract runtime chunk by default

## 7.1.0 (2021-06-01)

### Features

- add support for prefresh

## 7.0.2 (2021-06-01)

### Fixes

- update dependency sass-loader to v12

## 7.0.1 (2021-06-01)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3.0.1

## 7.0.0 (2021-05-31)

### BREAKING CHANGES

- underlying sass implementation is changed

### Performance Improvements

- use node-sass instead of dart-sass

## 6.0.3 (2021-05-29)

### Fixes

- improve vendor bundle names
- improve runtime chunk name

## 6.0.2 (2021-05-29)

### Fixes

- update dependency css-loader to v5.2.6

## 6.0.1 (2021-05-24)

### Documentation

- create README.md

### Fixes

- do not enforce vendor chunk extraction

## 6.0.0 (2021-05-24)

### BREAKING CHANGES

- you have to install @babel/core and postcss yourself

### Fixes

- move @babel/core and postcss to peer deps

## 5.0.4 (2021-05-23)

### Fixes

- add @babel/core
- add postcss

## 5.0.3 (2021-05-23)

### Fixes

- pin react-refresh version

## 5.0.2 (2021-05-22)

### Fixes

- update dependency sass to v1.34.0

## 5.0.1 (2021-05-21)

### Fixes

- update dependency source-map-loader to v3

## 4.0.0 (2021-05-21)

### BREAKING CHANGES

- webpack-assets.json does not exists when server is
  started

### Performance Improvements

- don't make node config wait for browser

## 3.3.0 (2021-05-21)

### Features

- add astroturf

## 3.2.8 (2021-05-21)

### Fixes

- update dependency sass to v1.33.0

## 3.2.7 (2021-05-20)

### Fixes

- update dependency css-loader to v5.2.5

## 3.2.6 (2021-05-18)

### Fixes

- add file-loader

## 3.2.5 (2021-05-17)

### Fixes

- update dependency webpack-bundle-analyzer to v4.4.2
- update dependency postcss-loader to v5.3.0

## 3.2.4 (2021-05-17)

### Fixes

- update dependency source-map-loader to v2.0.2

## 3.2.3 (2021-05-13)

### Fixes

- update dependency sass-loader to v11.1.1

## 3.2.2 (2021-05-13)

### Fixes

- update dependency sass to v1.32.13

## 3.2.1 (2021-05-13)

### Fixes

- update dependency css-minimizer-webpack-plugin to v3

## 3.2.0 (2021-05-11)

### Features

- add alias option
- allow absolute imports from paths.src
- set resolve.symlinks to false

## 3.1.4 (2021-05-11)

### Fixes

- tweak cache groups

## 3.1.3 (2021-05-11)

### Fixes

- make sure user can't override our defines
- always pretty-print assets json
- add typescript to resolve.extensions
- remove output.libraryTarget

## 3.1.1 (2021-05-11)

### Fixes

- use type instead of test for css cache group

## 3.1.0 (2021-05-11)

### Features

- add support for passing object as an entry

## 3.0.1 (2021-05-11)

### Fixes

- add files field to package.json

## 3.0.0 (2021-05-11)

### BREAKING CHANGES

- webpack-plugin-serve port is now 8000

### Fixes

- change webpack-plugin-serve port

## 2.1.1 (2021-05-10)

### Fixes

- update dependency sass-loader to v11.1.0

## 2.1.0 (2021-05-10)

### Features

- add define option

### Fixes

- include dynamically imported assets into json

## 2.0.3 (2021-05-10)

### Fixes

- add sass

## 2.0.2 (2021-05-10)

### Fixes

- add postcss-loader
- use require.resolve for loaders

## 2.0.1 (2021-05-10)

### Fixes

- add babel-loader
- add postcss-loader
- add source-map-loader
- add resolve-url-loader
- add sass-loader
- add url-loader

## 2.0.0 (2021-05-10)

### BREAKING CHANGES

- dotenv-flow/config must be added manually if needed

### Fixes

- remove dotenv-flow/config from entry

## 1.1.1 (2021-05-10)

### Fixes

- add source-map-support to peerDependencies

## 1.1.0 (2021-05-10)

### Features

- implement makeWebpackConfig

## 1.0.0 (2021-05-05)

### Features

- initial release
