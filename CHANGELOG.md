# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [11.1.0](https://github.com/kyubisation/angular-t9n/compare/11.0.0...11.1.0) (2020-11-20)

### Features

- add standalone variant ([2436d4f](https://github.com/kyubisation/angular-t9n/commit/2436d4f661981c26a85502e5b20cf460e0f034c4))

## [11.0.0](https://github.com/kyubisation/angular-t9n/compare/10.1.0...11.0.0) (2020-11-13)

### ⚠ BREAKING CHANGES

- This package now requires the Angular 11 CLI

### build

- update to Angular 11 ([936ff59](https://github.com/kyubisation/angular-t9n/commit/936ff59d53a253547bdeb8f4704c9c6a3b904ff2))

## [10.1.0](https://github.com/kyubisation/angular-t9n/compare/10.0.0...10.1.0) (2020-10-25)

### Features

- create target xlf file if it does not exist ([a0fa5c5](https://github.com/kyubisation/angular-t9n/commit/a0fa5c540c479c6ea53d9598a6b0927d01c89402))
- have filter be case insensitive ([663abb4](https://github.com/kyubisation/angular-t9n/commit/663abb443c7f8653973386b5d2b09c6e31f1b45f))
- support multiple translation files in the i18n section of angular.json ([13cedfc](https://github.com/kyubisation/angular-t9n/commit/13cedfc2124b5351ba46f5dc2c094600812e7159))

## [10.0.0](https://github.com/kyubisation/angular-t9n/compare/0.3.5...10.0.0) (2020-07-12)

### [0.3.5](https://github.com/kyubisation/angular-t9n/compare/0.3.4...0.3.5) (2020-07-11)

### Bug Fixes

- update target information on opening overview ([b3f36ff](https://github.com/kyubisation/angular-t9n/commit/b3f36ff9e1e6afd383e55bfa9cc9e8869fcd46eb))

### [0.3.4](https://github.com/kyubisation/angular-t9n/compare/0.3.3...0.3.4) (2020-07-11)

### Bug Fixes

- correct package includes ([25677b0](https://github.com/kyubisation/angular-t9n/commit/25677b0bd23b3985e6f2512232e0bfca8f6d6346))

### [0.3.3](https://github.com/kyubisation/angular-t9n/compare/0.3.2...0.3.3) (2020-07-11)

### [0.3.2](https://github.com/kyubisation/angular-t9n/compare/0.3.1...0.3.2) (2020-07-11)

### Features

- implement source orphan migration ([57905e9](https://github.com/kyubisation/angular-t9n/commit/57905e96877aad8a08e46626a198c89cd8494bea))
- minor usage improvements in root component ([8bacc7f](https://github.com/kyubisation/angular-t9n/commit/8bacc7fb888e77b0a2daae8b97c4e0522d7afa23))

### Bug Fixes

- configure correct websocket address ([cbd7743](https://github.com/kyubisation/angular-t9n/commit/cbd7743ba48e6291d4b85df86169c96f21fc0386))
- linting ([009fd8a](https://github.com/kyubisation/angular-t9n/commit/009fd8ab27574ccaa8a549c4301e3b37da6cdc5d))

### [0.3.1](https://github.com/kyubisation/angular-t9n/compare/0.3.0...0.3.1) (2020-01-16)

### Bug Fixes

- import should use target value from file ([26e0670](https://github.com/kyubisation/angular-t9n/commit/26e0670358c8d065fa4171cbfa6fcbd157a3c227))

## [0.3.0](https://github.com/kyubisation/angular-t9n/compare/0.2.1...0.3.0) (2020-01-05)

### Features

- add orphan template link in target response ([90b3102](https://github.com/kyubisation/angular-t9n/commit/90b3102e22a45a08df13293cc4a54c24f1cc9b4a))
- implement unit detail page ([9d1b8a5](https://github.com/kyubisation/angular-t9n/commit/9d1b8a53d1a46f10ece217e210278d8418a39270))
- replace orphan collapsible table with detail page ([9aabe0b](https://github.com/kyubisation/angular-t9n/commit/9aabe0b749d6522db3eb63904f374153a41fd913))

### [0.2.1](https://github.com/kyubisation/angular-t9n/compare/0.2.0...0.2.1) (2020-01-03)

## [0.2.0](https://github.com/kyubisation/angular-t9n/compare/0.1.2...0.2.0) (2020-01-02)

### ⚠ BREAKING CHANGES

- remove encoding as an option, since it might be problematic for the web app.

### Bug Fixes

- validate for existing target in add language modal ([83afd29](https://github.com/kyubisation/angular-t9n/commit/83afd29701423c4d7d030eddbee86a2689bf1104))

* remove encoding as an option ([245bbea](https://github.com/kyubisation/angular-t9n/commit/245bbea327b598630da7c6f0aeedd0d45ba68274))

### [0.1.2](https://github.com/kyubisation/angular-t9n/compare/0.1.1...0.1.2) (2020-01-02)

### Features

- display project name and source file path in overview ([bf7d764](https://github.com/kyubisation/angular-t9n/commit/bf7d7643e0100ae50dda4bf44857329655666bd6))
- translation server provides project name and source file path ([c5823e5](https://github.com/kyubisation/angular-t9n/commit/c5823e56e3ac54b5f9fcdc0b9980a8bbe82d5e61))

### Bug Fixes

- assign type="button" to add language modal cancel button ([4801c2e](https://github.com/kyubisation/angular-t9n/commit/4801c2e885fd5d8000073b52a92e93ad4afe15e5))
- ensure target is only created once ([fc8f12c](https://github.com/kyubisation/angular-t9n/commit/fc8f12c1133737af1c9f9429bf7acddf309782af))

### [0.1.1](https://github.com/kyubisation/angular-t9n/compare/0.1.0...0.1.1) (2020-01-01)

### Bug Fixes

- deal with initial input event in ie11 ([284470e](https://github.com/kyubisation/angular-t9n/commit/284470e36aca702f482893adda272047a5f2792e))

## 0.1.0 (2020-01-01)

### Features

- implement initial version ([#2](https://github.com/kyubisation/angular-t9n/issues/2)) ([1b5502c](https://github.com/kyubisation/angular-t9n/commit/1b5502cf80926817583eee674cf56c7e5b26301d))
