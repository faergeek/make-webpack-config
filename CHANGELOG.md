# [4.0.0](https://github.com/faergeek/make-webpack-config/compare/v3.3.0...v4.0.0) (2021-05-21)


### Performance Improvements

* don't make node config wait for browser ([5c377ca](https://github.com/faergeek/make-webpack-config/commit/5c377caeeb2717cdfcfffc167f8ea60e5eb3ca52))


### BREAKING CHANGES

* webpack-assets.json does not exists when server is
started

# [3.3.0](https://github.com/faergeek/make-webpack-config/compare/v3.2.8...v3.3.0) (2021-05-21)


### Features

* add astroturf ([bcb303f](https://github.com/faergeek/make-webpack-config/commit/bcb303fe404f8df81a949a109be290343651bc5d))

## [3.2.8](https://github.com/faergeek/make-webpack-config/compare/v3.2.7...v3.2.8) (2021-05-21)


### Bug Fixes

* **deps:** update dependency sass to v1.33.0 ([4e4d81b](https://github.com/faergeek/make-webpack-config/commit/4e4d81b59e358621ae50de5fa0232110c5d198ab))

## [3.2.7](https://github.com/faergeek/make-webpack-config/compare/v3.2.6...v3.2.7) (2021-05-20)


### Bug Fixes

* **deps:** update dependency css-loader to v5.2.5 ([ec4c7a9](https://github.com/faergeek/make-webpack-config/commit/ec4c7a9b0ac4014e99b6641a7ba1d1b4c878b55e))

## [3.2.6](https://github.com/faergeek/make-webpack-config/compare/v3.2.5...v3.2.6) (2021-05-18)


### Bug Fixes

* **deps:** add file-loader ([6317b25](https://github.com/faergeek/make-webpack-config/commit/6317b256e095ae1bf8ab9d211e1899123211430d))

## [3.2.5](https://github.com/faergeek/make-webpack-config/compare/v3.2.4...v3.2.5) (2021-05-17)


### Bug Fixes

* **deps:** update dependency postcss-loader to v5.3.0 ([d4b0f52](https://github.com/faergeek/make-webpack-config/commit/d4b0f52181f7c21aec691c49adbca3c04fd5e46b))
* **deps:** update dependency webpack-bundle-analyzer to v4.4.2 ([e53dcf8](https://github.com/faergeek/make-webpack-config/commit/e53dcf844629f7f1625d382b36f79c2f3d6167b1))

## [3.2.4](https://github.com/faergeek/make-webpack-config/compare/v3.2.3...v3.2.4) (2021-05-17)


### Bug Fixes

* **deps:** update dependency source-map-loader to v2.0.2 ([28bb281](https://github.com/faergeek/make-webpack-config/commit/28bb281cc8dfa821476656c45a5d0dacca8b4f32))

## [3.2.3](https://github.com/faergeek/make-webpack-config/compare/v3.2.2...v3.2.3) (2021-05-13)


### Bug Fixes

* **deps:** update dependency sass-loader to v11.1.1 ([6fea683](https://github.com/faergeek/make-webpack-config/commit/6fea683e2c63f6d0347e854ac5abf4db719f486c))

## [3.2.2](https://github.com/faergeek/make-webpack-config/compare/v3.2.1...v3.2.2) (2021-05-13)


### Bug Fixes

* **deps:** update dependency sass to v1.32.13 ([50e5187](https://github.com/faergeek/make-webpack-config/commit/50e51871cedfcf0035127bedf151e5993c5942cf))

## [3.2.1](https://github.com/faergeek/make-webpack-config/compare/v3.2.0...v3.2.1) (2021-05-13)


### Bug Fixes

* **deps:** update dependency css-minimizer-webpack-plugin to v3 ([5f2003a](https://github.com/faergeek/make-webpack-config/commit/5f2003ab28d01e0c008e0371640c418e1ab3ec1c))

# [3.2.0](https://github.com/faergeek/make-webpack-config/compare/v3.1.4...v3.2.0) (2021-05-11)


### Features

* add alias option ([9e97faa](https://github.com/faergeek/make-webpack-config/commit/9e97faa662326032d2fa6e629467774ca05b1ca8))
* allow absolute imports from paths.src ([e136900](https://github.com/faergeek/make-webpack-config/commit/e136900e3a95df0cccd64ca003eafcf959bdfb75))
* set resolve.symlinks to false ([4b9f222](https://github.com/faergeek/make-webpack-config/commit/4b9f2222c99fec3ed56a8555050ae2717d40d65a))

## [3.1.4](https://github.com/faergeek/make-webpack-config/compare/v3.1.3...v3.1.4) (2021-05-11)


### Bug Fixes

* tweak cache groups ([0f503dc](https://github.com/faergeek/make-webpack-config/commit/0f503dcbacc53db25c23ac4b7750e865f2cc947e))

## [3.1.3](https://github.com/faergeek/make-webpack-config/compare/v3.1.2...v3.1.3) (2021-05-11)


### Bug Fixes

* add typescript to resolve.extensions ([c7ea489](https://github.com/faergeek/make-webpack-config/commit/c7ea48918c352b5995ea55681fb6f6886530dd9e))
* always pretty-print assets json ([fba146c](https://github.com/faergeek/make-webpack-config/commit/fba146cef194a5d03331ecb6efec406d3f8b571f))
* make sure user can't override our defines ([4175ea8](https://github.com/faergeek/make-webpack-config/commit/4175ea82d50d5e3e84415be009bcd4f6265eee51))
* remove output.libraryTarget ([2088581](https://github.com/faergeek/make-webpack-config/commit/208858192f26f9a99ac14aabbd3a3ef0df9f2e16))

## [3.1.2](https://github.com/faergeek/make-webpack-config/compare/v3.1.1...v3.1.2) (2021-05-11)


### Reverts

* use mini-css-extract-plugin emit option ([41deb16](https://github.com/faergeek/make-webpack-config/commit/41deb16757a06af46bce9283bd81df5c145a6757))

## [3.1.1](https://github.com/faergeek/make-webpack-config/compare/v3.1.0...v3.1.1) (2021-05-11)


### Bug Fixes

* use type instead of test for css cache group ([0849a0a](https://github.com/faergeek/make-webpack-config/commit/0849a0ac88cb0d43a60a650cc4319d8d5cb744c9))

# [3.1.0](https://github.com/faergeek/make-webpack-config/compare/v3.0.1...v3.1.0) (2021-05-11)


### Features

* add support for passing object as an entry ([51c15b8](https://github.com/faergeek/make-webpack-config/commit/51c15b8b181b28a33a86c91a06a46acdbb8684e5))

## [3.0.1](https://github.com/faergeek/make-webpack-config/compare/v3.0.0...v3.0.1) (2021-05-11)


### Bug Fixes

* add files field to package.json ([a12f3b4](https://github.com/faergeek/make-webpack-config/commit/a12f3b495304d034857cfb0d777d9ba283b4a00a))

# [3.0.0](https://github.com/faergeek/make-webpack-config/compare/v2.1.1...v3.0.0) (2021-05-11)


### Bug Fixes

* change webpack-plugin-serve port ([d73a651](https://github.com/faergeek/make-webpack-config/commit/d73a651d5477cbb745b2d02dcefb66d5c58bfd91))


### BREAKING CHANGES

* webpack-plugin-serve port is now 8000

## [2.1.1](https://github.com/faergeek/make-webpack-config/compare/v2.1.0...v2.1.1) (2021-05-10)


### Bug Fixes

* **deps:** update dependency sass-loader to v11.1.0 ([3a8df91](https://github.com/faergeek/make-webpack-config/commit/3a8df9186a4c6892195a6a8e9d5b656a41ca2eb5))

# [2.1.0](https://github.com/faergeek/make-webpack-config/compare/v2.0.3...v2.1.0) (2021-05-10)


### Bug Fixes

* include dynamically imported assets into json ([4e722bd](https://github.com/faergeek/make-webpack-config/commit/4e722bd40b34755f2849609d06447bc82fc3a1ab))


### Features

* add define option ([a3cbc71](https://github.com/faergeek/make-webpack-config/commit/a3cbc71d32161821f0177e6b2139e40bc2ed5308))

## [2.0.3](https://github.com/faergeek/make-webpack-config/compare/v2.0.2...v2.0.3) (2021-05-10)


### Bug Fixes

* **deps:** add sass ([c360893](https://github.com/faergeek/make-webpack-config/commit/c3608934d54e5820c201fcbfdff8e651b2e8eeb0))

## [2.0.2](https://github.com/faergeek/make-webpack-config/compare/v2.0.1...v2.0.2) (2021-05-10)


### Bug Fixes

* **deps:** add postcss-loader ([3942d1b](https://github.com/faergeek/make-webpack-config/commit/3942d1b8bb922fabf5671f32479f35df267de04c))
* **deps:** use require.resolve for loaders ([a149cfd](https://github.com/faergeek/make-webpack-config/commit/a149cfd3add2d04edc9bacfcbd6c9669f8b5f8df))

## [2.0.1](https://github.com/faergeek/make-webpack-config/compare/v2.0.0...v2.0.1) (2021-05-10)


### Bug Fixes

* **deps:** add babel-loader ([e4ddb52](https://github.com/faergeek/make-webpack-config/commit/e4ddb5241c823cbd897de281656a113a1f21b43b))
* **deps:** add postcss-loader ([d5638ff](https://github.com/faergeek/make-webpack-config/commit/d5638ff0ce716799f61290accf60fcc421c5173a))
* **deps:** add resolve-url-loader ([1d46567](https://github.com/faergeek/make-webpack-config/commit/1d4656708b896b7a8f798927b1a380e775cdb4b4))
* **deps:** add sass-loader ([b0ed3b8](https://github.com/faergeek/make-webpack-config/commit/b0ed3b851f139635983a747644a366dde952716a))
* **deps:** add source-map-loader ([aefa4b9](https://github.com/faergeek/make-webpack-config/commit/aefa4b9a75c4c87b867adf119126e6b6f17b6247))
* **deps:** add url-loader ([2a2189e](https://github.com/faergeek/make-webpack-config/commit/2a2189e9ed14d9116d8faa762f38de8006728fac))

# [2.0.0](https://github.com/faergeek/make-webpack-config/compare/v1.1.1...v2.0.0) (2021-05-10)


### Bug Fixes

* remove dotenv-flow/config from entry ([249decb](https://github.com/faergeek/make-webpack-config/commit/249decb9014e08ef8ca78c95e3126fca82159482))


### BREAKING CHANGES

* dotenv-flow/config must be added manually if needed

## [1.1.1](https://github.com/faergeek/make-webpack-config/compare/v1.1.0...v1.1.1) (2021-05-10)


### Bug Fixes

* add source-map-support to peerDependencies ([f98ad3f](https://github.com/faergeek/make-webpack-config/commit/f98ad3f62c05e3d81d1a11b34033bd144ffbfb93))

# [1.1.0](https://github.com/faergeek/make-webpack-config/compare/v1.0.0...v1.1.0) (2021-05-10)


### Features

* implement makeWebpackConfig ([49ff0d0](https://github.com/faergeek/make-webpack-config/commit/49ff0d0d1a86b1881a827d823f8a8a724c121046))

# 1.0.0 (2021-05-05)


### Features

* initial release ([98567a1](https://github.com/faergeek/make-webpack-config/commit/98567a129e902e824318ed087c5623a4af5d2c76))
