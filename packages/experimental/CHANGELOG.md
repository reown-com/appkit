# @reown/appkit-experimental

## 1.2.0

### Minor Changes

- [#3153](https://github.com/reown-com/appkit/pull/3153) [`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where metadata values weren't overriding.

### Patch Changes

- Updated dependencies [[`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe)]:
  - @reown/appkit@1.2.0
  - @reown/appkit-common@1.2.0
  - @reown/appkit-core@1.2.0
  - @reown/appkit-ui@1.2.0

## 1.1.8

### Patch Changes

- [#3135](https://github.com/reown-com/appkit/pull/3135) [`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where `chainImages` option weren't working.

- [#3144](https://github.com/reown-com/appkit/pull/3144) [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72) Thanks [@magiziz](https://github.com/magiziz)! - Optimized connection handling for connectors.

- [#3148](https://github.com/reown-com/appkit/pull/3148) [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where multichain connectors weren't working.

- Updated dependencies [[`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05), [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72), [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35)]:
  - @reown/appkit@1.1.8
  - @reown/appkit-common@1.1.8
  - @reown/appkit-core@1.1.8
  - @reown/appkit-ui@1.1.8

## 1.1.7

### Patch Changes

- [#3108](https://github.com/reown-com/appkit/pull/3108) [`7523543`](https://github.com/reown-com/appkit/commit/7523543f5efd1e180f667fb9ed9b95459a332c78) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors adapters to handle account switches properly

- [#3113](https://github.com/reown-com/appkit/pull/3113) [`0c93f2f`](https://github.com/reown-com/appkit/commit/0c93f2f64b3d8c71b902815991162ce84024a202) Thanks [@zoruka](https://github.com/zoruka)! - Adds experimental:

  - SIWX interfaces
  - SIWX AppKit options config
  - SIWX initialization

- [#3121](https://github.com/reown-com/appkit/pull/3121) [`f30d116`](https://github.com/reown-com/appkit/commit/f30d11632e3beee7cefe6863fb7873b420a6e84f) Thanks [@magiziz](https://github.com/magiziz)! - Added `useDisconnect` hook to `@reown/appkit/react` and `@reown/appkit/vue`.

- Updated dependencies [[`7523543`](https://github.com/reown-com/appkit/commit/7523543f5efd1e180f667fb9ed9b95459a332c78), [`0c93f2f`](https://github.com/reown-com/appkit/commit/0c93f2f64b3d8c71b902815991162ce84024a202), [`f30d116`](https://github.com/reown-com/appkit/commit/f30d11632e3beee7cefe6863fb7873b420a6e84f)]:
  - @reown/appkit@1.1.7
  - @reown/appkit-common@1.1.7
  - @reown/appkit-core@1.1.7
  - @reown/appkit-ui@1.1.7

## 1.1.6

### Patch Changes

- [#3110](https://github.com/reown-com/appkit/pull/3110) [`5767552`](https://github.com/reown-com/appkit/commit/5767552e61505bf3726dae35c84fe7601112199d) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where web app wallets weren't working.

- [#3106](https://github.com/reown-com/appkit/pull/3106) [`28b3311`](https://github.com/reown-com/appkit/commit/28b3311b9cafeae374b147e7283448e2d518087f) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where `eth_getBalance` was being called twice after connection.

- [#3111](https://github.com/reown-com/appkit/pull/3111) [`1a7a872`](https://github.com/reown-com/appkit/commit/1a7a8722d4065448831fc31126baa3f946f80060) Thanks [@tomiir](https://github.com/tomiir)! - Increases timeout for balance unavailable toast to 30s.

- [#3101](https://github.com/reown-com/appkit/pull/3101) [`41eed18`](https://github.com/reown-com/appkit/commit/41eed1835c244e407a2295ef8024d52d92ad82dd) Thanks [@enesozturk](https://github.com/enesozturk)! - Export Wagmi packages from CDN package

- [#3107](https://github.com/reown-com/appkit/pull/3107) [`d3c92fb`](https://github.com/reown-com/appkit/commit/d3c92fb036954723f074d173704a84fc2c424443) Thanks [@tomiir](https://github.com/tomiir)! - Adds experimental sessions feature ui elements and flows.
  Adds revoke session flow.

- [#3100](https://github.com/reown-com/appkit/pull/3100) [`201484e`](https://github.com/reown-com/appkit/commit/201484e0a49dd4a2465c55b83c90dfc3a631f9ee) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where the wagmi adapter was making excessive network calls.

- Updated dependencies [[`5767552`](https://github.com/reown-com/appkit/commit/5767552e61505bf3726dae35c84fe7601112199d), [`28b3311`](https://github.com/reown-com/appkit/commit/28b3311b9cafeae374b147e7283448e2d518087f), [`1a7a872`](https://github.com/reown-com/appkit/commit/1a7a8722d4065448831fc31126baa3f946f80060), [`41eed18`](https://github.com/reown-com/appkit/commit/41eed1835c244e407a2295ef8024d52d92ad82dd), [`d3c92fb`](https://github.com/reown-com/appkit/commit/d3c92fb036954723f074d173704a84fc2c424443), [`201484e`](https://github.com/reown-com/appkit/commit/201484e0a49dd4a2465c55b83c90dfc3a631f9ee)]:
  - @reown/appkit@1.1.6
  - @reown/appkit-common@1.1.6
  - @reown/appkit-core@1.1.6
  - @reown/appkit-ui@1.1.6

## 1.1.5

### Patch Changes

- [#3096](https://github.com/reown-com/appkit/pull/3096) [`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576) Thanks [@magiziz](https://github.com/magiziz)! - Refactored token balance error message and ensured that token balances are only fetched again after 5 seconds if the token balance API fails.

- [#3080](https://github.com/reown-com/appkit/pull/3080) [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where recommendations would use outdated ids instead of reown.id.

- [#3095](https://github.com/reown-com/appkit/pull/3095) [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor toast/snackbar component to be able to call sequentially

- Updated dependencies [[`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576), [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401), [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24)]:
  - @reown/appkit-core@1.1.5
  - @reown/appkit@1.1.5
  - @reown/appkit-common@1.1.5
  - @reown/appkit-ui@1.1.5

## 1.1.4

### Patch Changes

- [#3082](https://github.com/reown-com/appkit/pull/3082) [`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614) Thanks [@tomiir](https://github.com/tomiir)! - Adds wui-permission-contract-call to experimental package. Adds w3m-smart-session-created-view to experimental package

- [#3086](https://github.com/reown-com/appkit/pull/3086) [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where ethers and ethers5 adapters were causing infinite network requests

- Updated dependencies [[`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614), [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655)]:
  - @reown/appkit-core@1.1.4
  - @reown/appkit-ui@1.1.4
  - @reown/appkit@1.1.4
  - @reown/appkit-common@1.1.4

## 1.1.3

### Patch Changes

- [#3075](https://github.com/reown-com/appkit/pull/3075) [`7f99593`](https://github.com/reown-com/appkit/commit/7f99593a1b413ee433f21356ff1d4d9cea96f135) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Added NativeTokenRecurringAllowancePermission and ERC20RecurringAllowancePermission support on appkit-experimental/smart-session sdk

- [#3081](https://github.com/reown-com/appkit/pull/3081) [`9d8ce0a`](https://github.com/reown-com/appkit/commit/9d8ce0a2d34d61f0ddc037752ee0cc1733c99de6) Thanks [@magiziz](https://github.com/magiziz)! - Refactored frame timeouts

- [#3073](https://github.com/reown-com/appkit/pull/3073) [`3627dd1`](https://github.com/reown-com/appkit/commit/3627dd11bd1bc8d5d8c66d59f655675af1d369fd) Thanks [@magiziz](https://github.com/magiziz)! - Added maximum timeouts for frame requests

- [#3068](https://github.com/reown-com/appkit/pull/3068) [`bf5bfb3`](https://github.com/reown-com/appkit/commit/bf5bfb33a8226f0cf85366ddc3b00fb74d6555ab) Thanks [@magiziz](https://github.com/magiziz)! - Improved account name selection flow

- [#2777](https://github.com/reown-com/appkit/pull/2777) [`a4de9f8`](https://github.com/reown-com/appkit/commit/a4de9f8de3ae0bf807006325b2dd14d42b91a078) Thanks [@bulgakovk](https://github.com/bulgakovk)! - Fix displaying pure EIP-6963 wallets.

- [#3069](https://github.com/reown-com/appkit/pull/3069) [`6cf5745`](https://github.com/reown-com/appkit/commit/6cf57458fb4b957dbea9dfc43424ee479ca4a989) Thanks [@KannuSingh](https://github.com/KannuSingh)! - fix: set status on syncAccount when connector is walletconnect for wagmi adapter

- [#3085](https://github.com/reown-com/appkit/pull/3085) [`185ff63`](https://github.com/reown-com/appkit/commit/185ff636aefdb09a5f1cbb97ae79051f639e9d58) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds Unichain support to the RPC supported networks array

- [#3072](https://github.com/reown-com/appkit/pull/3072) [`e4adf06`](https://github.com/reown-com/appkit/commit/e4adf06af522684efbacae613bb954cbac7454a2) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors wagmi constructor to handle custom transpor objects

- Updated dependencies [[`7f99593`](https://github.com/reown-com/appkit/commit/7f99593a1b413ee433f21356ff1d4d9cea96f135), [`9d8ce0a`](https://github.com/reown-com/appkit/commit/9d8ce0a2d34d61f0ddc037752ee0cc1733c99de6), [`3627dd1`](https://github.com/reown-com/appkit/commit/3627dd11bd1bc8d5d8c66d59f655675af1d369fd), [`bf5bfb3`](https://github.com/reown-com/appkit/commit/bf5bfb33a8226f0cf85366ddc3b00fb74d6555ab), [`a4de9f8`](https://github.com/reown-com/appkit/commit/a4de9f8de3ae0bf807006325b2dd14d42b91a078), [`6cf5745`](https://github.com/reown-com/appkit/commit/6cf57458fb4b957dbea9dfc43424ee479ca4a989), [`185ff63`](https://github.com/reown-com/appkit/commit/185ff636aefdb09a5f1cbb97ae79051f639e9d58), [`e4adf06`](https://github.com/reown-com/appkit/commit/e4adf06af522684efbacae613bb954cbac7454a2)]:
  - @reown/appkit@1.1.3
  - @reown/appkit-common@1.1.3
  - @reown/appkit-core@1.1.3

## 1.1.2

### Patch Changes

- [#2858](https://github.com/reown-com/appkit/pull/2858) [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0) Thanks [@renovate](https://github.com/apps/renovate)! - Upgrades ethers v6

- [#3048](https://github.com/reown-com/appkit/pull/3048) [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098) Thanks [@KannuSingh](https://github.com/KannuSingh)! - fix: add missing setProvider and setProviderId call for connector other than walletconnect on syncAccount

- [#3053](https://github.com/reown-com/appkit/pull/3053) [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808) Thanks [@enesozturk](https://github.com/enesozturk)! - Reverts removing types package on ethers adapter

- [#3046](https://github.com/reown-com/appkit/pull/3046) [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor CDN package to properly export our modules

- [#3058](https://github.com/reown-com/appkit/pull/3058) [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da) Thanks [@magiziz](https://github.com/magiziz)! - Improved mobile connection UX

- Updated dependencies [[`53f5525`](https://github.com/reown-com/appkit/commit/53f552510380e99f95a2ac7065be3cb81d674dab), [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0), [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098), [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808), [`30e2ee5`](https://github.com/reown-com/appkit/commit/30e2ee523de1150a66727582d0522bfd7e9b7264), [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89), [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da)]:
  - @reown/appkit@1.1.2
  - @reown/appkit-common@1.1.2
  - @reown/appkit-core@1.1.2

## 1.1.1

### Patch Changes

- [#3036](https://github.com/reown-com/appkit/pull/3036) [`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes assert syntax to import json modules

- Updated dependencies [[`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073)]:
  - @reown/appkit@1.1.1
  - @reown/appkit-common@1.1.1
  - @reown/appkit-core@1.1.1

## 1.0.1

### Patch Changes

- [#3033](https://github.com/reown-com/appkit/pull/3033) [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades solana/web3js deps

- [#3032](https://github.com/reown-com/appkit/pull/3032) [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec) Thanks [@enesozturk](https://github.com/enesozturk)! - Exports util functions for networks path

- [#3030](https://github.com/reown-com/appkit/pull/3030) [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Added experimental package with smart-session feature.

- Updated dependencies [[`c5a2107`](https://github.com/reown-com/appkit/commit/c5a21078a4b04e0518015c3600b16851b6d5318b), [`e1b8720`](https://github.com/reown-com/appkit/commit/e1b8720121fd49985fe488e401600482ce691571), [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564), [`72010c6`](https://github.com/reown-com/appkit/commit/72010c694d1b7a4c21995e64cfa51d6df0f966d8), [`d558f2b`](https://github.com/reown-com/appkit/commit/d558f2bfbf215928eded5236a3dd984c76fd9c37), [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec), [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19)]:
  - @reown/appkit@1.1.0
  - @reown/appkit-common@1.1.0
  - @reown/appkit-core@1.1.0
