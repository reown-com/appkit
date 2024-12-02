# @reown/appkit-siwx

## 1.5.3

### Patch Changes

- [#3332](https://github.com/reown-com/appkit/pull/3332) [`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61) Thanks [@zoruka](https://github.com/zoruka)! - Adds check for missing address or chainId when getting siwe session for guarantee of backwards compatibility.

- [#3352](https://github.com/reown-com/appkit/pull/3352) [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue when modal keeps in infinite spinning state when switching to a supported network from unsupported network view

- [#3328](https://github.com/reown-com/appkit/pull/3328) [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where it is not possible to switch network with MM mobile wallet

- [#3355](https://github.com/reown-com/appkit/pull/3355) [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where adding chains on ethers doesn't work

- [#3329](https://github.com/reown-com/appkit/pull/3329) [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5) Thanks [@enesozturk](https://github.com/enesozturk)! - Sync wagmi status with account controller status

- Updated dependencies [[`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61), [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2), [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e), [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5), [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5)]:
  - @reown/appkit-common@1.5.3
  - @reown/appkit-core@1.5.3

## 1.5.2

### Patch Changes

- [#3310](https://github.com/reown-com/appkit/pull/3310) [`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Remove coinbase from default screen

- [#3316](https://github.com/reown-com/appkit/pull/3316) [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7) Thanks [@zoruka](https://github.com/zoruka)! - - Fix onSignOut not being called for activeCaipAddress changes;

  - Fix signOut/onSignOut not being called on useDisconnect hook calls;
  - Fix AppKitSIWEClient signIn and signOut methods to call new SIWX handlers;
  - Add tests for mapToSIWX function and usage against AppKit.

- [#3299](https://github.com/reown-com/appkit/pull/3299) [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Resolve cases where wagmi doesn't recognize wc session and unable to switch from unsupported network"

- Updated dependencies [[`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91), [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7), [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356)]:
  - @reown/appkit-common@1.5.2
  - @reown/appkit-core@1.5.2

## 1.5.1

### Patch Changes

- [#3276](https://github.com/reown-com/appkit/pull/3276) [`6c62b7f`](https://github.com/reown-com/appkit/commit/6c62b7fe34af15b3ef6fff9c5946bbe6c7935742) Thanks [@zoruka](https://github.com/zoruka)! - Removes @reown/appkit-siwe dependency from other packages and improve error message for SIWX request signature function

- [#3219](https://github.com/reown-com/appkit/pull/3219) [`f33aa3b`](https://github.com/reown-com/appkit/commit/f33aa3bd38aa426bcf8ff08ce3314b02bad61e78) Thanks [@tomiir](https://github.com/tomiir)! - Update secure site url to include version 2.0.0 parameter.
  Defers frame load until it's needed on email or social connection or reconnection.

- [#3278](https://github.com/reown-com/appkit/pull/3278) [`0b04fdf`](https://github.com/reown-com/appkit/commit/0b04fdf8b44afc1723708235fdb8009b98ffdcd2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue with broken states on swaps

- [#3286](https://github.com/reown-com/appkit/pull/3286) [`2c82245`](https://github.com/reown-com/appkit/commit/2c82245e40d08d690ea8f5fd9e737e25dc7f1d1b) Thanks [@zoruka](https://github.com/zoruka)! - Remove condition from SIWE signOut returning false to keep backwards compatibility

- [#3290](https://github.com/reown-com/appkit/pull/3290) [`ac1845e`](https://github.com/reown-com/appkit/commit/ac1845e022072e8e2d03449c28229d3576b2dd28) Thanks [@zoruka](https://github.com/zoruka)! - Fix for wrong checking on Solana devnet id

- [#3285](https://github.com/reown-com/appkit/pull/3285) [`329cb92`](https://github.com/reown-com/appkit/commit/329cb92fb87866dff4cf925894ab2e3ac03e0f2c) Thanks [@maxmaxme](https://github.com/maxmaxme)! - Updates Vue type decleration module

- [#3289](https://github.com/reown-com/appkit/pull/3289) [`8236837`](https://github.com/reown-com/appkit/commit/82368374693d4620bf035df2d79b724441c93b0e) Thanks [@zoruka](https://github.com/zoruka)! - Fix wagmi not reconnecting with siwe on page refresh

- [#3271](https://github.com/reown-com/appkit/pull/3271) [`c4d4d2c`](https://github.com/reown-com/appkit/commit/c4d4d2c1ffa5efcd31ee0d182d5fa70b2efdedc0) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Don't show browser wallet when injected provider is not detected

- Updated dependencies [[`6c62b7f`](https://github.com/reown-com/appkit/commit/6c62b7fe34af15b3ef6fff9c5946bbe6c7935742), [`f33aa3b`](https://github.com/reown-com/appkit/commit/f33aa3bd38aa426bcf8ff08ce3314b02bad61e78), [`0b04fdf`](https://github.com/reown-com/appkit/commit/0b04fdf8b44afc1723708235fdb8009b98ffdcd2), [`2c82245`](https://github.com/reown-com/appkit/commit/2c82245e40d08d690ea8f5fd9e737e25dc7f1d1b), [`ac1845e`](https://github.com/reown-com/appkit/commit/ac1845e022072e8e2d03449c28229d3576b2dd28), [`329cb92`](https://github.com/reown-com/appkit/commit/329cb92fb87866dff4cf925894ab2e3ac03e0f2c), [`8236837`](https://github.com/reown-com/appkit/commit/82368374693d4620bf035df2d79b724441c93b0e), [`c4d4d2c`](https://github.com/reown-com/appkit/commit/c4d4d2c1ffa5efcd31ee0d182d5fa70b2efdedc0)]:
  - @reown/appkit-core@1.5.1
  - @reown/appkit-common@1.5.1

## 1.5.0

### Minor Changes

- [#3194](https://github.com/reown-com/appkit/pull/3194) [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b) Thanks [@zoruka](https://github.com/zoruka)! - Replace SIWE with new SIWX

### Patch Changes

- [#3266](https://github.com/reown-com/appkit/pull/3266) [`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Show unsupported network UI on reconnect when chainId in wallet is not supported

- [#3254](https://github.com/reown-com/appkit/pull/3254) [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Expose disconnect method

- [#3250](https://github.com/reown-com/appkit/pull/3250) [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixed an issue where MetaMask injected browser didn't show up on ethers in some cases

- Updated dependencies [[`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b), [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6), [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b), [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6)]:
  - @reown/appkit-common@1.5.0
  - @reown/appkit-core@1.5.0

## 1.4.1

### Patch Changes

- [#3246](https://github.com/reown-com/appkit/pull/3246) [`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue when connectors are not syncing correctly

- Updated dependencies [[`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2)]:
  - @reown/appkit-common@1.4.1
  - @reown/appkit-core@1.4.1

## 1.4.0

### Minor Changes

- [#3076](https://github.com/reown-com/appkit/pull/3076) [`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Implementing new architecture design for better handling and scalibity of the various adapters

### Patch Changes

- Updated dependencies [[`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a)]:
  - @reown/appkit-common@1.4.0
  - @reown/appkit-core@1.4.0

## 1.3.2

### Patch Changes

- [#3216](https://github.com/reown-com/appkit/pull/3216) [`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6) Thanks [@magiziz](https://github.com/magiziz)! - Improved gradient scroll effect on connect view.

- [#3154](https://github.com/reown-com/appkit/pull/3154) [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9) Thanks [@tomiir](https://github.com/tomiir)! - Adds error message to swap error event

- [#3206](https://github.com/reown-com/appkit/pull/3206) [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e) Thanks [@magiziz](https://github.com/magiziz)! - Added walletconnect certified badge in all wallets view.

- [#3220](https://github.com/reown-com/appkit/pull/3220) [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where the connect modal on mobile was always showing 'Browser Wallet' option when the injected provider wasn't detected.

- Updated dependencies [[`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6), [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9), [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e), [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d)]:
  - @reown/appkit-common@1.3.2
  - @reown/appkit-core@1.3.2

## 1.3.1

### Patch Changes

- [#3207](https://github.com/reown-com/appkit/pull/3207) [`3bfbbb9`](https://github.com/reown-com/appkit/commit/3bfbbb947f53dc49de3ab467e03c35e81aa72787) Thanks [@magiziz](https://github.com/magiziz)! - Introduced a new feature with an option to enable the terms of service and/or privacy policy checkbox.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit/react'
  import { mainnet } from '@reown/appkit/networks'

  const modal = createAppKit({
    adapters: [
      /* adapters */
    ],
    networks: [mainnet],
    defaultNetwork: mainnet,
    projectId: 'YOUR_PROJECT_ID',
    features: {
      legalCheckbox: true // Optional - defaults to false
    },
    termsConditionsUrl: '...',
    privacyPolicyUrl: '...'
  })
  ```

- [#3179](https://github.com/reown-com/appkit/pull/3179) [`ffb30d3`](https://github.com/reown-com/appkit/commit/ffb30d37a3a193c1dc18d152177f12d869110a3d) Thanks [@zoruka](https://github.com/zoruka)! - Fixes for improving SIWX initialization and flows

- [#3197](https://github.com/reown-com/appkit/pull/3197) [`879ad0a`](https://github.com/reown-com/appkit/commit/879ad0ad98b8a41fcb66c0bf5a75ceacd05d367d) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors Vue hooks to listen state as expected

- Updated dependencies [[`3bfbbb9`](https://github.com/reown-com/appkit/commit/3bfbbb947f53dc49de3ab467e03c35e81aa72787), [`ffb30d3`](https://github.com/reown-com/appkit/commit/ffb30d37a3a193c1dc18d152177f12d869110a3d), [`879ad0a`](https://github.com/reown-com/appkit/commit/879ad0ad98b8a41fcb66c0bf5a75ceacd05d367d)]:
  - @reown/appkit-core@1.3.1
  - @reown/appkit-common@1.3.1

## 1.3.0

### Minor Changes

- [#3186](https://github.com/reown-com/appkit/pull/3186) [`41c0292`](https://github.com/reown-com/appkit/commit/41c02928b9171651da705778891c08cac1b3ae19) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates public component names with appkit prefix

### Patch Changes

- [#3188](https://github.com/reown-com/appkit/pull/3188) [`69e8bde`](https://github.com/reown-com/appkit/commit/69e8bdec3276e35a809912053c27828ab49fc964) Thanks [@magiziz](https://github.com/magiziz)! - Improved error handling for auth and universal provider connectors.

- [#3189](https://github.com/reown-com/appkit/pull/3189) [`db30b41`](https://github.com/reown-com/appkit/commit/db30b4160b130295dfd1e3276627f584e27537bd) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where Coinbase Wallet did not reconnect after refreshing the page when using ethers/ethers5 adapters.

- [#3190](https://github.com/reown-com/appkit/pull/3190) [`d9bb0bb`](https://github.com/reown-com/appkit/commit/d9bb0bb86e872cb0b74a0d2114130f09f89e9ac8) Thanks [@magiziz](https://github.com/magiziz)! - Fixes issue where ethers and ethers5 adapters didn't set the proper caip address when switching accounts manually.

- [#3201](https://github.com/reown-com/appkit/pull/3201) [`48cbfbe`](https://github.com/reown-com/appkit/commit/48cbfbeb7831109ee564d67151715336aa445c1e) Thanks [@tomiir](https://github.com/tomiir)! - Adds clientId to all blockchain api requests on a relay connection

- [#3191](https://github.com/reown-com/appkit/pull/3191) [`a3cf602`](https://github.com/reown-com/appkit/commit/a3cf602e95301e91f27970b9901abab382122080) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where email input validation errors broke the button styles.

- [#3203](https://github.com/reown-com/appkit/pull/3203) [`05feaed`](https://github.com/reown-com/appkit/commit/05feaed87c8181987cad508fe4725ca64ba56ab7) Thanks [@tomiir](https://github.com/tomiir)! - Improves SnackBar styles and routes proper relay messages to it on wc-connecting-view

- [#3193](https://github.com/reown-com/appkit/pull/3193) [`56fe99a`](https://github.com/reown-com/appkit/commit/56fe99ad21cd468a0203b5f2b5dd3bd29d9ba020) Thanks [@tomiir](https://github.com/tomiir)! - Improves UX/UI of multi-account screen for embedded wallet

- Updated dependencies [[`69e8bde`](https://github.com/reown-com/appkit/commit/69e8bdec3276e35a809912053c27828ab49fc964), [`db30b41`](https://github.com/reown-com/appkit/commit/db30b4160b130295dfd1e3276627f584e27537bd), [`d9bb0bb`](https://github.com/reown-com/appkit/commit/d9bb0bb86e872cb0b74a0d2114130f09f89e9ac8), [`41c0292`](https://github.com/reown-com/appkit/commit/41c02928b9171651da705778891c08cac1b3ae19), [`48cbfbe`](https://github.com/reown-com/appkit/commit/48cbfbeb7831109ee564d67151715336aa445c1e), [`a3cf602`](https://github.com/reown-com/appkit/commit/a3cf602e95301e91f27970b9901abab382122080), [`05feaed`](https://github.com/reown-com/appkit/commit/05feaed87c8181987cad508fe4725ca64ba56ab7), [`56fe99a`](https://github.com/reown-com/appkit/commit/56fe99ad21cd468a0203b5f2b5dd3bd29d9ba020)]:
  - @reown/appkit-common@1.3.0
  - @reown/appkit-core@1.3.0

## 1.2.0

### Minor Changes

- [#3123](https://github.com/reown-com/appkit/pull/3123) [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX package

### Patch Changes

- [#3172](https://github.com/reown-com/appkit/pull/3172) [`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX Solana verifier

- [#3164](https://github.com/reown-com/appkit/pull/3164) [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds switch network methods and hooks

- [#3173](https://github.com/reown-com/appkit/pull/3173) [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds listeners for account and network states for plain JS users

- [#3175](https://github.com/reown-com/appkit/pull/3175) [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes swap gas availability check for smart accounts

- [#3174](https://github.com/reown-com/appkit/pull/3174) [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c) Thanks [@enesozturk](https://github.com/enesozturk)! - Switch to ES build for CDN use cases

- [#3171](https://github.com/reown-com/appkit/pull/3171) [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98) Thanks [@zoruka](https://github.com/zoruka)! - Adds UI components for SIWX

- Updated dependencies [[`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77), [`3d40e7c`](https://github.com/reown-com/appkit/commit/3d40e7c4df068f074367eda2b682345f9441fcf8), [`6eef87d`](https://github.com/reown-com/appkit/commit/6eef87d234384e93e8cac75632188bfd21918de4), [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8), [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1), [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a), [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24), [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c), [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98)]:
  - @reown/appkit-common@1.2.1
  - @reown/appkit-core@1.2.1
