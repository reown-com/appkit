# @reown/appkit-adapter-ethers

## 1.6.2

### Patch Changes

- [#3491](https://github.com/reown-com/appkit/pull/3491) [`0a8ead2`](https://github.com/reown-com/appkit/commit/0a8ead262ee0a2e0c116b1eaeb80fd5086d0298f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where browser tab option was showing for all wallets

- [#3509](https://github.com/reown-com/appkit/pull/3509) [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where accounts were not correctly set

- [#3516](https://github.com/reown-com/appkit/pull/3516) [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728) Thanks [@zoruka](https://github.com/zoruka)! - Add unit testing for Bitcoin adapter and fix unused default values

- [#3514](https://github.com/reown-com/appkit/pull/3514) [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `pendingTransactions` event was being emitted infinitely in wagmi adapter.

  Additionally another option was added to wagmi adapter called `pendingTransactionsFilter`.

  **Example usage**

  ```ts
  const wagmiAdapter = new WagmiAdapter({
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    pendingTransactionsFilter: {
      enable: true,
      pollingInterval: 15_000
    }
  })

  createAppKit({
    adapters: [wagmiAdapter],
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID'
  })
  ```

- Updated dependencies [[`0a8ead2`](https://github.com/reown-com/appkit/commit/0a8ead262ee0a2e0c116b1eaeb80fd5086d0298f), [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867), [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728), [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72)]:
  - @reown/appkit-scaffold-ui@1.6.2
  - @reown/appkit@1.6.2
  - @reown/appkit-utils@1.6.2
  - @reown/appkit-common@1.6.2
  - @reown/appkit-core@1.6.2
  - @reown/appkit-polyfills@1.6.2
  - @reown/appkit-ui@1.6.2
  - @reown/appkit-wallet@1.6.2

## 1.6.1

### Patch Changes

- [#3503](https://github.com/reown-com/appkit/pull/3503) [`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759) Thanks [@zoruka](https://github.com/zoruka)! - Set active chain as first chain when calling authenticate on universal provider

- [#3465](https://github.com/reown-com/appkit/pull/3465) [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120) Thanks [@enesozturk](https://github.com/enesozturk)! - refactor: adds background transition

- [#3456](https://github.com/reown-com/appkit/pull/3456) [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144) Thanks [@zoruka](https://github.com/zoruka)! - Add Bitcoin network image id

- [#3455](https://github.com/reown-com/appkit/pull/3455) [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220) Thanks [@zoruka](https://github.com/zoruka)! - Add icon with copy function on Bitcoin account view

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connectors did not remain connected after page refresh despite being connected previously

- [#3447](https://github.com/reown-com/appkit/pull/3447) [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix allowUnsupportedChain param to work correctly

- [#3177](https://github.com/reown-com/appkit/pull/3177) [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Adds walletConnectProvider flag to inject a UniversalProvider instance to be used by AppKit'

- [#3501](https://github.com/reown-com/appkit/pull/3501) [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468) Thanks [@Cali93](https://github.com/Cali93)! - Fix logic for authentication header on CloudAuthSIWX

- [#3461](https://github.com/reown-com/appkit/pull/3461) [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where approving with Smart Account didn't work

- [#3449](https://github.com/reown-com/appkit/pull/3449) [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade dependency versions

- [#3460](https://github.com/reown-com/appkit/pull/3460) [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors disconnect business logic for multiple adapter use cases

- [#3485](https://github.com/reown-com/appkit/pull/3485) [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connect view's mask image styling with resize observer for dynamic masking

- [#3476](https://github.com/reown-com/appkit/pull/3476) [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01) Thanks [@zoruka](https://github.com/zoruka)! - Add jsdocs comments explaining params and functions from SIWX and Bitcoin packages.

- [#3505](https://github.com/reown-com/appkit/pull/3505) [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d) Thanks [@tomiir](https://github.com/tomiir)! - Makes bitcoin adapter public

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Coinbase Wallet wasn't working on iOS safari

- [#3471](https://github.com/reown-com/appkit/pull/3471) [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2) Thanks [@zoruka](https://github.com/zoruka)! - Clear SIWX sessions when calling ConnectionController.disconnect

- [#3482](https://github.com/reown-com/appkit/pull/3482) [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc) Thanks [@enesozturk](https://github.com/enesozturk)! - Expose a public function to get connect method order with AppKit instance

- [#3499](https://github.com/reown-com/appkit/pull/3499) [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Improve send flow UX with better error handling

- [#3466](https://github.com/reown-com/appkit/pull/3466) [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9) Thanks [@enesozturk](https://github.com/enesozturk)! - refactor: make the wallet image listen state updates for embedded use case

- [#3454](https://github.com/reown-com/appkit/pull/3454) [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796) Thanks [@zoruka](https://github.com/zoruka)! - Filter out duplicated addresses from WalletStandardConnector on Bitcoin adapter

- [#3462](https://github.com/reown-com/appkit/pull/3462) [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781) Thanks [@zoruka](https://github.com/zoruka)! - Adds parsing of Universal Provider session_event to get accountsChanged event

- [#3489](https://github.com/reown-com/appkit/pull/3489) [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connector id from Local Storage wasn't in sync

- [#3450](https://github.com/reown-com/appkit/pull/3450) [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d) Thanks [@zoruka](https://github.com/zoruka)! - Fix the chainId response when connecting to bitcoin with multichain adapters

- [#3502](https://github.com/reown-com/appkit/pull/3502) [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where undefined address would throw an error polluting logs

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where adapters and connectors were not synchronized

- [#3504](https://github.com/reown-com/appkit/pull/3504) [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi connector won't disconnect

- [#3446](https://github.com/reown-com/appkit/pull/3446) [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036) Thanks [@enesozturk](https://github.com/enesozturk)! - Filter out when there is duplicate wallet items in recents and injected wallets

- Updated dependencies [[`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759), [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120), [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144), [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c), [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771), [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468), [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678), [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58), [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5), [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31), [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01), [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2), [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc), [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871), [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9), [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796), [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781), [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8), [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d), [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde), [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036)]:
  - @reown/appkit@1.6.1
  - @reown/appkit-core@1.6.1
  - @reown/appkit-utils@1.6.1
  - @reown/appkit-common@1.6.1
  - @reown/appkit-polyfills@1.6.1
  - @reown/appkit-scaffold-ui@1.6.1
  - @reown/appkit-ui@1.6.1
  - @reown/appkit-wallet@1.6.1

## 1.6.0

### Minor Changes

- [#3425](https://github.com/reown-com/appkit/pull/3425) [`b5e2dfa`](https://github.com/reown-com/appkit/commit/b5e2dfab8a3cd96db3e30b5bcaf1478a3d55cb2d) Thanks [@zoruka](https://github.com/zoruka)! - Add CloudAuthSIWX configuration

### Patch Changes

- [#3375](https://github.com/reown-com/appkit/pull/3375) [`26e9f12`](https://github.com/reown-com/appkit/commit/26e9f12aef1d5e32f7814be189de5d405903b378) Thanks [@magiziz](https://github.com/magiziz)! - Removed upgrade to smart account screen

- [#3429](https://github.com/reown-com/appkit/pull/3429) [`388e6d6`](https://github.com/reown-com/appkit/commit/388e6d676ffd0bd76d4973b7f3e2c90c459daafb) Thanks [@magiziz](https://github.com/magiziz)! - Debug mode is now set to true by default. Additionally fixed an issue where alerts and console errors were not working in debug mode.

- [#3341](https://github.com/reown-com/appkit/pull/3341) [`548962c`](https://github.com/reown-com/appkit/commit/548962c710dd973da2128c415bb2beaea044751f) Thanks [@magiziz](https://github.com/magiziz)! - Edited wallet guide text

- [#3404](https://github.com/reown-com/appkit/pull/3404) [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where setEIP6963Enabled is not getting called

- [#3382](https://github.com/reown-com/appkit/pull/3382) [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix subscribeProviders method in AppKit client

- [#3376](https://github.com/reown-com/appkit/pull/3376) [`69f9469`](https://github.com/reown-com/appkit/commit/69f94693357bcf2dbffc8aa4c81aa0c0a592fc1f) Thanks [@zoruka](https://github.com/zoruka)! - Fix BIP122Verifier replacing the library used for one with a wider range of signature verifiations

- [#3437](https://github.com/reown-com/appkit/pull/3437) [`4d2ddad`](https://github.com/reown-com/appkit/commit/4d2ddad12979a1f79b3c28c9c69d44aad6c9b013) Thanks [@zoruka](https://github.com/zoruka)! - Fixes the Solana wallets not being recognized as installed in the all wallets list

- [#3371](https://github.com/reown-com/appkit/pull/3371) [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds separate event for swap approval process

- [#3350](https://github.com/reown-com/appkit/pull/3350) [`0c55e65`](https://github.com/reown-com/appkit/commit/0c55e6576da71a7aa5922a02ff489184bf65c026) Thanks [@zoruka](https://github.com/zoruka)! - Add SIWX BIP122Verifier

- [#3419](https://github.com/reown-com/appkit/pull/3419) [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes state and storage syncronization and persisting on multiple adapter instances

- [#3392](https://github.com/reown-com/appkit/pull/3392) [`1021422`](https://github.com/reown-com/appkit/commit/1021422c157b3a8a4d90edcd40f435adac21d119) Thanks [@tomiir](https://github.com/tomiir)! - Only syncs identity on address updates

- [#3363](https://github.com/reown-com/appkit/pull/3363) [`7236c86`](https://github.com/reown-com/appkit/commit/7236c866986a9bf218963542e445de27b86ab7f0) Thanks [@zoruka](https://github.com/zoruka)! - Adds SatsConnectConnector wallet events biding with AppKit and LeatherConnector

- [#3408](https://github.com/reown-com/appkit/pull/3408) [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b) Thanks [@zoruka](https://github.com/zoruka)! - Add Bitcoin OKX Wallet connector

- [#3432](https://github.com/reown-com/appkit/pull/3432) [`9fce094`](https://github.com/reown-com/appkit/commit/9fce0941613fa98896d3a0537f7f73b5763d3a07) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes phantom and coinbase deeplink url parameters to be encoded

- [#3417](https://github.com/reown-com/appkit/pull/3417) [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Solana Connection was not being set on WC Relay wallets, causing transactions to fail.

- [#3401](https://github.com/reown-com/appkit/pull/3401) [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d) Thanks [@zoruka](https://github.com/zoruka)! - Add BitcoinAdapter.getBalance implementation based on BitcoinApi

- [#3397](https://github.com/reown-com/appkit/pull/3397) [`ca659e7`](https://github.com/reown-com/appkit/commit/ca659e71e38cfa137b73b12a42e99cbcf99ff02a) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add farcaster events

- [#3390](https://github.com/reown-com/appkit/pull/3390) [`4c9410a`](https://github.com/reown-com/appkit/commit/4c9410a76a932b83115f7eec043ff88aab38f7e0) Thanks [@tomiir](https://github.com/tomiir)! - Uses default chain rpc url for wallet_addEthereumChain requests on ethers

- [#3400](https://github.com/reown-com/appkit/pull/3400) [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors some ui rendering logics and enables setting extra configurations via modal functions

- [#3387](https://github.com/reown-com/appkit/pull/3387) [`8f1ce50`](https://github.com/reown-com/appkit/commit/8f1ce503548c1218d5d13f174341a0742aa2d22e) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades solana/web3.js package version

- [#3403](https://github.com/reown-com/appkit/pull/3403) [`d4352b0`](https://github.com/reown-com/appkit/commit/d4352b01aa71f6fce8f67ec50225f51250b0bfc8) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - iframe deeplink fix

- [#3420](https://github.com/reown-com/appkit/pull/3420) [`d07a72b`](https://github.com/reown-com/appkit/commit/d07a72bb6397bb4580b9999bdbe927817d5b015e) Thanks [@magiziz](https://github.com/magiziz)! - Added `enableWalletGuide` option to allow disabling the wallet guide footer when social or email logins are enabled.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit'

  const modal = createAppKit({
    adapters: [
      /* Adapters */
    ],
    networks: [
      /* Networks */
    ],
    projectId: 'YOUR_RPOJECT_ID',
    enableWalletGuide: false // Optional - defaults to true
  })
  ```

- [#3434](https://github.com/reown-com/appkit/pull/3434) [`2a7a963`](https://github.com/reown-com/appkit/commit/2a7a963accb966a42c206fefebd1c9f78b358215) Thanks [@enesozturk](https://github.com/enesozturk)! - Hides the go back button on header when embedded mode is enabled

- [#3421](https://github.com/reown-com/appkit/pull/3421) [`50c619a`](https://github.com/reown-com/appkit/commit/50c619aacfbcf34952d78465a597bcbf59d9bdf8) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Return custom RPC when configured in wagmi config

- [#3415](https://github.com/reown-com/appkit/pull/3415) [`9e1e4c9`](https://github.com/reown-com/appkit/commit/9e1e4c9ac565c2164750f178b6d896e57d3b68e5) Thanks [@magiziz](https://github.com/magiziz)! - Introduced wallet button component and custom hook for headless integration.

  Components example:

  ```tsx
  import '@reown/appkit-wallet-button'

  export function YourApp() {
    return (
      <>
        {/* QR Code (WalletConnect) */}
        <appkit-wallet-button wallet="walletConnect" />

        {/* Wallets */}
        <appkit-wallet-button wallet="metamask" />
        <appkit-wallet-button wallet="trust" />
        <appkit-wallet-button wallet="coinbase" />

        {/* Socials */}
        <appkit-wallet-button wallet="google" />
        <appkit-wallet-button wallet="x" />
        <appkit-wallet-button wallet="discord" />
        <appkit-wallet-button wallet="farcaster" />
      </>
    )
  }
  ```

  Hook example:

  ```tsx
  import { useAppKitWallet } from '@reown/appkit-wallet-button/react'

  export function YourApp() {
    const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return (
      <>
        <button onClick={() => connect('walletConnect')}>Open QR modal</button>
        <button onClick={() => connect('metamask')}>Connect to MetaMask</button>
        <button onClick={() => connect('google')}>Connect to Google</button>
      </>
    )
  }
  ```

  Additionally a new theme variable property called `--w3m-qr-color` was added where you can configure a custom color for the QR code.

  ```tsx
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    /* Your Config */
    themeVariables: {
      '--w3m-qr-color': '...', // Optional
      '--w3m-color-mix': '...',
      '--w3m-color-mix-strength': 50
    }
  })
  ```

- [#3382](https://github.com/reown-com/appkit/pull/3382) [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - feat: Fetch balance of specific adapter after a transactions has been made

- [#3381](https://github.com/reown-com/appkit/pull/3381) [`48b9054`](https://github.com/reown-com/appkit/commit/48b90547f06c40a9030c0ea6d869d94237a1053d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the Solana adapter would continue to return `walletProvider.publicKey` from the `useAppKitProvider` hook even after disconnection.

- [#3439](https://github.com/reown-com/appkit/pull/3439) [`3e9758e`](https://github.com/reown-com/appkit/commit/3e9758e18b1fb9d3b08546901bbd33fab4f40827) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where wagmi connectors are unable to restore a session

- [#3443](https://github.com/reown-com/appkit/pull/3443) [`53ecc19`](https://github.com/reown-com/appkit/commit/53ecc19bb15f257dfd4afa34c855dd3a0620d4f9) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where pending transaction listener was causing infinite request.

- [#3377](https://github.com/reown-com/appkit/pull/3377) [`76acc12`](https://github.com/reown-com/appkit/commit/76acc1288879884443d71e798f33b81aee1e2945) Thanks [@zoruka](https://github.com/zoruka)! - Refine bitcoin support wallet standard

- [#3346](https://github.com/reown-com/appkit/pull/3346) [`b7b8e3d`](https://github.com/reown-com/appkit/commit/b7b8e3db393aaa2b42454b7abcd074e2a7f4ab43) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: show correct market price in swaps + ui improvements

- [#3412](https://github.com/reown-com/appkit/pull/3412) [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes embedded mode route redirection issue and adds transition for border radius values

- [#3388](https://github.com/reown-com/appkit/pull/3388) [`1e05f00`](https://github.com/reown-com/appkit/commit/1e05f004b8778c1ce1693681824676fda5b5aa5f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds error message to email otp verification error event

- Updated dependencies [[`26e9f12`](https://github.com/reown-com/appkit/commit/26e9f12aef1d5e32f7814be189de5d405903b378), [`388e6d6`](https://github.com/reown-com/appkit/commit/388e6d676ffd0bd76d4973b7f3e2c90c459daafb), [`548962c`](https://github.com/reown-com/appkit/commit/548962c710dd973da2128c415bb2beaea044751f), [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`69f9469`](https://github.com/reown-com/appkit/commit/69f94693357bcf2dbffc8aa4c81aa0c0a592fc1f), [`4d2ddad`](https://github.com/reown-com/appkit/commit/4d2ddad12979a1f79b3c28c9c69d44aad6c9b013), [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c), [`0c55e65`](https://github.com/reown-com/appkit/commit/0c55e6576da71a7aa5922a02ff489184bf65c026), [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5), [`1021422`](https://github.com/reown-com/appkit/commit/1021422c157b3a8a4d90edcd40f435adac21d119), [`7236c86`](https://github.com/reown-com/appkit/commit/7236c866986a9bf218963542e445de27b86ab7f0), [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b), [`9fce094`](https://github.com/reown-com/appkit/commit/9fce0941613fa98896d3a0537f7f73b5763d3a07), [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e), [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d), [`ca659e7`](https://github.com/reown-com/appkit/commit/ca659e71e38cfa137b73b12a42e99cbcf99ff02a), [`4c9410a`](https://github.com/reown-com/appkit/commit/4c9410a76a932b83115f7eec043ff88aab38f7e0), [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389), [`8f1ce50`](https://github.com/reown-com/appkit/commit/8f1ce503548c1218d5d13f174341a0742aa2d22e), [`d4352b0`](https://github.com/reown-com/appkit/commit/d4352b01aa71f6fce8f67ec50225f51250b0bfc8), [`d07a72b`](https://github.com/reown-com/appkit/commit/d07a72bb6397bb4580b9999bdbe927817d5b015e), [`2a7a963`](https://github.com/reown-com/appkit/commit/2a7a963accb966a42c206fefebd1c9f78b358215), [`50c619a`](https://github.com/reown-com/appkit/commit/50c619aacfbcf34952d78465a597bcbf59d9bdf8), [`9e1e4c9`](https://github.com/reown-com/appkit/commit/9e1e4c9ac565c2164750f178b6d896e57d3b68e5), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`48b9054`](https://github.com/reown-com/appkit/commit/48b90547f06c40a9030c0ea6d869d94237a1053d), [`3e9758e`](https://github.com/reown-com/appkit/commit/3e9758e18b1fb9d3b08546901bbd33fab4f40827), [`53ecc19`](https://github.com/reown-com/appkit/commit/53ecc19bb15f257dfd4afa34c855dd3a0620d4f9), [`76acc12`](https://github.com/reown-com/appkit/commit/76acc1288879884443d71e798f33b81aee1e2945), [`b7b8e3d`](https://github.com/reown-com/appkit/commit/b7b8e3db393aaa2b42454b7abcd074e2a7f4ab43), [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d), [`1e05f00`](https://github.com/reown-com/appkit/commit/1e05f004b8778c1ce1693681824676fda5b5aa5f), [`b5e2dfa`](https://github.com/reown-com/appkit/commit/b5e2dfab8a3cd96db3e30b5bcaf1478a3d55cb2d)]:
  - @reown/appkit-scaffold-ui@1.6.0
  - @reown/appkit@1.6.0
  - @reown/appkit-utils@1.6.0
  - @reown/appkit-common@1.6.0
  - @reown/appkit-core@1.6.0
  - @reown/appkit-polyfills@1.6.0
  - @reown/appkit-ui@1.6.0
  - @reown/appkit-wallet@1.6.0

## 1.5.3

### Patch Changes

- [#3332](https://github.com/reown-com/appkit/pull/3332) [`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61) Thanks [@zoruka](https://github.com/zoruka)! - Adds check for missing address or chainId when getting siwe session for guarantee of backwards compatibility.

- [#3352](https://github.com/reown-com/appkit/pull/3352) [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue when modal keeps in infinite spinning state when switching to a supported network from unsupported network view

- [#3328](https://github.com/reown-com/appkit/pull/3328) [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where it is not possible to switch network with MM mobile wallet

- [#3355](https://github.com/reown-com/appkit/pull/3355) [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where adding chains on ethers doesn't work

- [#3329](https://github.com/reown-com/appkit/pull/3329) [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5) Thanks [@enesozturk](https://github.com/enesozturk)! - Sync wagmi status with account controller status

- Updated dependencies [[`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61), [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2), [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e), [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5), [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5)]:
  - @reown/appkit@1.5.3
  - @reown/appkit-utils@1.5.3
  - @reown/appkit-common@1.5.3
  - @reown/appkit-core@1.5.3
  - @reown/appkit-polyfills@1.5.3
  - @reown/appkit-scaffold-ui@1.5.3
  - @reown/appkit-ui@1.5.3
  - @reown/appkit-wallet@1.5.3

## 1.5.2

### Patch Changes

- [#3310](https://github.com/reown-com/appkit/pull/3310) [`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Remove coinbase from default screen

- [#3316](https://github.com/reown-com/appkit/pull/3316) [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7) Thanks [@zoruka](https://github.com/zoruka)! - - Fix onSignOut not being called for activeCaipAddress changes;

  - Fix signOut/onSignOut not being called on useDisconnect hook calls;
  - Fix AppKitSIWEClient signIn and signOut methods to call new SIWX handlers;
  - Add tests for mapToSIWX function and usage against AppKit.

- [#3299](https://github.com/reown-com/appkit/pull/3299) [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Resolve cases where wagmi doesn't recognize wc session and unable to switch from unsupported network"

- Updated dependencies [[`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91), [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7), [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356)]:
  - @reown/appkit-scaffold-ui@1.5.2
  - @reown/appkit@1.5.2
  - @reown/appkit-utils@1.5.2
  - @reown/appkit-common@1.5.2
  - @reown/appkit-core@1.5.2
  - @reown/appkit-polyfills@1.5.2
  - @reown/appkit-ui@1.5.2
  - @reown/appkit-wallet@1.5.2

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
  - @reown/appkit-scaffold-ui@1.5.1
  - @reown/appkit@1.5.1
  - @reown/appkit-core@1.5.1
  - @reown/appkit-utils@1.5.1
  - @reown/appkit-common@1.5.1
  - @reown/appkit-polyfills@1.5.1
  - @reown/appkit-ui@1.5.1
  - @reown/appkit-wallet@1.5.1

## 1.5.0

### Minor Changes

- [#3194](https://github.com/reown-com/appkit/pull/3194) [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b) Thanks [@zoruka](https://github.com/zoruka)! - Replace SIWE with new SIWX

### Patch Changes

- [#3266](https://github.com/reown-com/appkit/pull/3266) [`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Show unsupported network UI on reconnect when chainId in wallet is not supported

- [#3254](https://github.com/reown-com/appkit/pull/3254) [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Expose disconnect method

- [#3250](https://github.com/reown-com/appkit/pull/3250) [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixed an issue where MetaMask injected browser didn't show up on ethers in some cases

- Updated dependencies [[`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b), [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6), [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b), [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6)]:
  - @reown/appkit@1.5.0
  - @reown/appkit-utils@1.5.0
  - @reown/appkit-common@1.5.0
  - @reown/appkit-core@1.5.0
  - @reown/appkit-polyfills@1.5.0
  - @reown/appkit-scaffold-ui@1.5.0
  - @reown/appkit-siwe@1.5.0
  - @reown/appkit-ui@1.5.0
  - @reown/appkit-wallet@1.5.0

## 1.4.1

### Patch Changes

- [#3246](https://github.com/reown-com/appkit/pull/3246) [`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue when connectors are not syncing correctly

- Updated dependencies [[`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2)]:
  - @reown/appkit@1.4.1
  - @reown/appkit-utils@1.4.1
  - @reown/appkit-common@1.4.1
  - @reown/appkit-core@1.4.1
  - @reown/appkit-polyfills@1.4.1
  - @reown/appkit-scaffold-ui@1.4.1
  - @reown/appkit-siwe@1.4.1
  - @reown/appkit-ui@1.4.1
  - @reown/appkit-wallet@1.4.1

## 1.4.0

### Minor Changes

- [#3076](https://github.com/reown-com/appkit/pull/3076) [`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Implementing new architecture design for better handling and scalibity of the various adapters

### Patch Changes

- Updated dependencies [[`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a)]:
  - @reown/appkit-utils@1.4.0
  - @reown/appkit-scaffold-ui@1.4.0
  - @reown/appkit-polyfills@1.4.0
  - @reown/appkit@1.4.0
  - @reown/appkit-common@1.4.0
  - @reown/appkit-wallet@1.4.0
  - @reown/appkit-core@1.4.0
  - @reown/appkit-siwe@1.4.0
  - @reown/appkit-ui@1.4.0

## 1.3.2

### Patch Changes

- [#3216](https://github.com/reown-com/appkit/pull/3216) [`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6) Thanks [@magiziz](https://github.com/magiziz)! - Improved gradient scroll effect on connect view.

- [#3154](https://github.com/reown-com/appkit/pull/3154) [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9) Thanks [@tomiir](https://github.com/tomiir)! - Adds error message to swap error event

- [#3206](https://github.com/reown-com/appkit/pull/3206) [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e) Thanks [@magiziz](https://github.com/magiziz)! - Added walletconnect certified badge in all wallets view.

- [#3220](https://github.com/reown-com/appkit/pull/3220) [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where the connect modal on mobile was always showing 'Browser Wallet' option when the injected provider wasn't detected.

- Updated dependencies [[`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6), [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9), [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e), [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d)]:
  - @reown/appkit-scaffold-ui@1.3.2
  - @reown/appkit@1.3.2
  - @reown/appkit-utils@1.3.2
  - @reown/appkit-common@1.3.2
  - @reown/appkit-core@1.3.2
  - @reown/appkit-polyfills@1.3.2
  - @reown/appkit-siwe@1.3.2
  - @reown/appkit-ui@1.3.2
  - @reown/appkit-wallet@1.3.2

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
  - @reown/appkit-scaffold-ui@1.3.1
  - @reown/appkit@1.3.1
  - @reown/appkit-core@1.3.1
  - @reown/appkit-ui@1.3.1
  - @reown/appkit-utils@1.3.1
  - @reown/appkit-common@1.3.1
  - @reown/appkit-polyfills@1.3.1
  - @reown/appkit-siwe@1.3.1
  - @reown/appkit-wallet@1.3.1

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
  - @reown/appkit-utils@1.3.0
  - @reown/appkit@1.3.0
  - @reown/appkit-common@1.3.0
  - @reown/appkit-core@1.3.0
  - @reown/appkit-polyfills@1.3.0
  - @reown/appkit-scaffold-ui@1.3.0
  - @reown/appkit-siwe@1.3.0
  - @reown/appkit-ui@1.3.0
  - @reown/appkit-wallet@1.3.0

## 1.2.1

### Patch Changes

- [#3172](https://github.com/reown-com/appkit/pull/3172) [`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX Solana verifier

- [#2827](https://github.com/reown-com/appkit/pull/2827) [`3d40e7c`](https://github.com/reown-com/appkit/commit/3d40e7c4df068f074367eda2b682345f9441fcf8) Thanks [@tomiir](https://github.com/tomiir)! - Removes intermediate screen for Embedded Wallet multi-account

- [#3161](https://github.com/reown-com/appkit/pull/3161) [`6eef87d`](https://github.com/reown-com/appkit/commit/6eef87d234384e93e8cac75632188bfd21918de4) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where metadata values weren't included in the universal provider.

- [#3123](https://github.com/reown-com/appkit/pull/3123) [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX package

- [#3164](https://github.com/reown-com/appkit/pull/3164) [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds switch network methods and hooks

- [#3173](https://github.com/reown-com/appkit/pull/3173) [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds listeners for account and network states for plain JS users

- [#3175](https://github.com/reown-com/appkit/pull/3175) [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes swap gas availability check for smart accounts

- [#3174](https://github.com/reown-com/appkit/pull/3174) [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c) Thanks [@enesozturk](https://github.com/enesozturk)! - Switch to ES build for CDN use cases

- [#3171](https://github.com/reown-com/appkit/pull/3171) [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98) Thanks [@zoruka](https://github.com/zoruka)! - Adds UI components for SIWX

- Updated dependencies [[`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77), [`3d40e7c`](https://github.com/reown-com/appkit/commit/3d40e7c4df068f074367eda2b682345f9441fcf8), [`6eef87d`](https://github.com/reown-com/appkit/commit/6eef87d234384e93e8cac75632188bfd21918de4), [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8), [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1), [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a), [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24), [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c), [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98)]:
  - @reown/appkit@1.2.1
  - @reown/appkit-utils@1.2.1
  - @reown/appkit-common@1.2.1
  - @reown/appkit-core@1.2.1
  - @reown/appkit-polyfills@1.2.1
  - @reown/appkit-scaffold-ui@1.2.1
  - @reown/appkit-siwe@1.2.1
  - @reown/appkit-ui@1.2.1
  - @reown/appkit-wallet@1.2.1

## 1.2.0

### Minor Changes

- [#3153](https://github.com/reown-com/appkit/pull/3153) [`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where metadata values weren't overriding.

### Patch Changes

- Updated dependencies [[`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe)]:
  - @reown/appkit@1.2.0
  - @reown/appkit-utils@1.2.0
  - @reown/appkit-common@1.2.0
  - @reown/appkit-core@1.2.0
  - @reown/appkit-polyfills@1.2.0
  - @reown/appkit-scaffold-ui@1.2.0
  - @reown/appkit-siwe@1.2.0
  - @reown/appkit-ui@1.2.0

## 1.1.8

### Patch Changes

- [#3135](https://github.com/reown-com/appkit/pull/3135) [`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where `chainImages` option weren't working.

- [#3144](https://github.com/reown-com/appkit/pull/3144) [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72) Thanks [@magiziz](https://github.com/magiziz)! - Optimized connection handling for connectors.

- [#3148](https://github.com/reown-com/appkit/pull/3148) [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where multichain connectors weren't working.

- Updated dependencies [[`e16f0fe`](https://github.com/reown-com/appkit/commit/e16f0fe0dcc8c049e9c38560e177247c1eea9779), [`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05), [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72), [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35)]:
  - @reown/appkit-wallet@1.2.0
  - @reown/appkit-utils@1.1.8
  - @reown/appkit-scaffold-ui@1.1.8
  - @reown/appkit@1.1.8
  - @reown/appkit-common@1.1.8
  - @reown/appkit-core@1.1.8
  - @reown/appkit-polyfills@1.1.8
  - @reown/appkit-siwe@1.1.8
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
  - @reown/appkit-scaffold-ui@1.1.7
  - @reown/appkit@1.1.7
  - @reown/appkit-utils@1.1.7
  - @reown/appkit-common@1.1.7
  - @reown/appkit-core@1.1.7
  - @reown/appkit-polyfills@1.1.7
  - @reown/appkit-siwe@1.1.7
  - @reown/appkit-ui@1.1.7
  - @reown/appkit-wallet@1.1.7

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
  - @reown/appkit-scaffold-ui@1.1.6
  - @reown/appkit@1.1.6
  - @reown/appkit-utils@1.1.6
  - @reown/appkit-common@1.1.6
  - @reown/appkit-core@1.1.6
  - @reown/appkit-polyfills@1.1.6
  - @reown/appkit-siwe@1.1.6
  - @reown/appkit-ui@1.1.6
  - @reown/appkit-wallet@1.1.6

## 1.1.5

### Patch Changes

- [#3096](https://github.com/reown-com/appkit/pull/3096) [`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576) Thanks [@magiziz](https://github.com/magiziz)! - Refactored token balance error message and ensured that token balances are only fetched again after 5 seconds if the token balance API fails.

- [#3080](https://github.com/reown-com/appkit/pull/3080) [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where recommendations would use outdated ids instead of reown.id.

- [#3095](https://github.com/reown-com/appkit/pull/3095) [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor toast/snackbar component to be able to call sequentially

- Updated dependencies [[`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576), [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401), [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24)]:
  - @reown/appkit-core@1.1.5
  - @reown/appkit@1.1.5
  - @reown/appkit-utils@1.1.5
  - @reown/appkit-common@1.1.5
  - @reown/appkit-polyfills@1.1.5
  - @reown/appkit-scaffold-ui@1.1.5
  - @reown/appkit-siwe@1.1.5
  - @reown/appkit-ui@1.1.5
  - @reown/appkit-wallet@1.1.5

## 1.1.4

### Patch Changes

- [#3082](https://github.com/reown-com/appkit/pull/3082) [`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614) Thanks [@tomiir](https://github.com/tomiir)! - Adds wui-permission-contract-call to experimental package. Adds w3m-smart-session-created-view to experimental package

- [#3086](https://github.com/reown-com/appkit/pull/3086) [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where ethers and ethers5 adapters were causing infinite network requests

- Updated dependencies [[`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614), [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655)]:
  - @reown/appkit-scaffold-ui@1.1.4
  - @reown/appkit-core@1.1.4
  - @reown/appkit-ui@1.1.4
  - @reown/appkit@1.1.4
  - @reown/appkit-utils@1.1.4
  - @reown/appkit-common@1.1.4
  - @reown/appkit-polyfills@1.1.4
  - @reown/appkit-siwe@1.1.4
  - @reown/appkit-wallet@1.1.4

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
  - @reown/appkit-utils@1.1.3
  - @reown/appkit-common@1.1.3
  - @reown/appkit-core@1.1.3
  - @reown/appkit-polyfills@1.1.3
  - @reown/appkit-scaffold-ui@1.1.3
  - @reown/appkit-siwe@1.1.3
  - @reown/appkit-ui@1.1.3
  - @reown/appkit-wallet@1.1.3

## 1.1.2

### Patch Changes

- [#3014](https://github.com/reown-com/appkit/pull/3014) [`53f5525`](https://github.com/reown-com/appkit/commit/53f552510380e99f95a2ac7065be3cb81d674dab) Thanks [@Magehernan](https://github.com/Magehernan)! - Removes connector list variable duplication for wagmi adapter

- [#2858](https://github.com/reown-com/appkit/pull/2858) [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0) Thanks [@renovate](https://github.com/apps/renovate)! - Upgrades ethers v6

- [#3048](https://github.com/reown-com/appkit/pull/3048) [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098) Thanks [@KannuSingh](https://github.com/KannuSingh)! - fix: add missing setProvider and setProviderId call for connector other than walletconnect on syncAccount

- [#3053](https://github.com/reown-com/appkit/pull/3053) [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808) Thanks [@enesozturk](https://github.com/enesozturk)! - Reverts removing types package on ethers adapter

- [#3027](https://github.com/reown-com/appkit/pull/3027) [`30e2ee5`](https://github.com/reown-com/appkit/commit/30e2ee523de1150a66727582d0522bfd7e9b7264) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes beta tag from Swap screens

- [#3046](https://github.com/reown-com/appkit/pull/3046) [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor CDN package to properly export our modules

- [#3058](https://github.com/reown-com/appkit/pull/3058) [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da) Thanks [@magiziz](https://github.com/magiziz)! - Improved mobile connection UX

- Updated dependencies [[`53f5525`](https://github.com/reown-com/appkit/commit/53f552510380e99f95a2ac7065be3cb81d674dab), [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0), [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098), [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808), [`30e2ee5`](https://github.com/reown-com/appkit/commit/30e2ee523de1150a66727582d0522bfd7e9b7264), [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89), [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da)]:
  - @reown/appkit@1.1.2
  - @reown/appkit-utils@1.1.2
  - @reown/appkit-common@1.1.2
  - @reown/appkit-core@1.1.2
  - @reown/appkit-polyfills@1.1.2
  - @reown/appkit-scaffold-ui@1.1.2
  - @reown/appkit-siwe@1.1.2
  - @reown/appkit-ui@1.1.2
  - @reown/appkit-wallet@1.1.2

## 1.1.1

### Patch Changes

- [#3036](https://github.com/reown-com/appkit/pull/3036) [`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes assert syntax to import json modules

- Updated dependencies [[`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073)]:
  - @reown/appkit@1.1.1
  - @reown/appkit-utils@1.1.1
  - @reown/appkit-common@1.1.1
  - @reown/appkit-core@1.1.1
  - @reown/appkit-polyfills@1.1.1
  - @reown/appkit-scaffold-ui@1.1.1
  - @reown/appkit-siwe@1.1.1
  - @reown/appkit-ui@1.1.1
  - @reown/appkit-wallet@1.1.1

## 1.1.0

### Minor Changes

- [#2955](https://github.com/reown-com/appkit/pull/2955) [`c5a2107`](https://github.com/reown-com/appkit/commit/c5a21078a4b04e0518015c3600b16851b6d5318b) Thanks [@enesozturk](https://github.com/enesozturk)! - Add Viem chains support

### Patch Changes

- [#3012](https://github.com/reown-com/appkit/pull/3012) [`e1b8720`](https://github.com/reown-com/appkit/commit/e1b8720121fd49985fe488e401600482ce691571) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where SIWE modal wasn't showing up for some mobile wallets.

- [#3033](https://github.com/reown-com/appkit/pull/3033) [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades solana/web3js deps

- [#2999](https://github.com/reown-com/appkit/pull/2999) [`72010c6`](https://github.com/reown-com/appkit/commit/72010c694d1b7a4c21995e64cfa51d6df0f966d8) Thanks [@zoruka](https://github.com/zoruka)! - Remove duplicated Solana chains declared on Solana Adapter package.

- [#3002](https://github.com/reown-com/appkit/pull/3002) [`d558f2b`](https://github.com/reown-com/appkit/commit/d558f2bfbf215928eded5236a3dd984c76fd9c37) Thanks [@tomiir](https://github.com/tomiir)! - Exposes version in AppKit class

- [#3032](https://github.com/reown-com/appkit/pull/3032) [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec) Thanks [@enesozturk](https://github.com/enesozturk)! - Exports util functions for networks path

- [#3030](https://github.com/reown-com/appkit/pull/3030) [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Added experimental package with smart-session feature.

- Updated dependencies [[`c5a2107`](https://github.com/reown-com/appkit/commit/c5a21078a4b04e0518015c3600b16851b6d5318b), [`e1b8720`](https://github.com/reown-com/appkit/commit/e1b8720121fd49985fe488e401600482ce691571), [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564), [`72010c6`](https://github.com/reown-com/appkit/commit/72010c694d1b7a4c21995e64cfa51d6df0f966d8), [`d558f2b`](https://github.com/reown-com/appkit/commit/d558f2bfbf215928eded5236a3dd984c76fd9c37), [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec), [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19)]:
  - @reown/appkit-utils@1.1.0
  - @reown/appkit-scaffold-ui@1.1.0
  - @reown/appkit@1.1.0
  - @reown/appkit-common@1.1.0
  - @reown/appkit-core@1.1.0
  - @reown/appkit-siwe@1.1.0
  - @reown/appkit-ui@1.1.0
  - @reown/appkit-polyfills@1.1.0
  - @reown/appkit-wallet@1.1.0

## 1.0.7

### Patch Changes

- [#2977](https://github.com/reown-com/appkit/pull/2977) [`d45545d`](https://github.com/reown-com/appkit/commit/d45545ddd4073c35214db273b090ae8b4df9ef61) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where email line separator was not showing when social logins were disabled and `emailShowWallets` was set to false.

- [#2990](https://github.com/reown-com/appkit/pull/2990) [`c2e391d`](https://github.com/reown-com/appkit/commit/c2e391d832aa3b5a1c2850cc49467bd4ef1e56f9) Thanks [@zoruka](https://github.com/zoruka)! - Fixes external connectors not appearing when using Solana adapter

- [#2998](https://github.com/reown-com/appkit/pull/2998) [`e1081e9`](https://github.com/reown-com/appkit/commit/e1081e957b3ed73c068d6092923b59b0e27815d1) Thanks [@zoruka](https://github.com/zoruka)! - Fixes failing to connect with extension wallets on Solana Adapter

- [#2985](https://github.com/reown-com/appkit/pull/2985) [`b949143`](https://github.com/reown-com/appkit/commit/b949143a0838810f7ae17a85e4c17acae10b888c) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates wagmi adapter to pass all custom wagmi configs to the createConfig function

- [#3001](https://github.com/reown-com/appkit/pull/3001) [`6ad2530`](https://github.com/reown-com/appkit/commit/6ad253000261e60ddc0f60b341a658da6636bd3e) Thanks [@tomiir](https://github.com/tomiir)! - Adds FRAME_READY event for W3mFrameProvider

- [#2989](https://github.com/reown-com/appkit/pull/2989) [`d40f978`](https://github.com/reown-com/appkit/commit/d40f978fe685fbc9599cdac36a99b12ec4350d3c) Thanks [@zoruka](https://github.com/zoruka)! - Disable names feature flow for Solana networks

- Updated dependencies [[`d45545d`](https://github.com/reown-com/appkit/commit/d45545ddd4073c35214db273b090ae8b4df9ef61), [`c2e391d`](https://github.com/reown-com/appkit/commit/c2e391d832aa3b5a1c2850cc49467bd4ef1e56f9), [`e1081e9`](https://github.com/reown-com/appkit/commit/e1081e957b3ed73c068d6092923b59b0e27815d1), [`b949143`](https://github.com/reown-com/appkit/commit/b949143a0838810f7ae17a85e4c17acae10b888c), [`6ad2530`](https://github.com/reown-com/appkit/commit/6ad253000261e60ddc0f60b341a658da6636bd3e), [`d40f978`](https://github.com/reown-com/appkit/commit/d40f978fe685fbc9599cdac36a99b12ec4350d3c)]:
  - @reown/appkit-scaffold-ui@1.0.7
  - @reown/appkit@1.0.7
  - @reown/appkit-utils@1.0.7
  - @reown/appkit-common@1.0.7
  - @reown/appkit-core@1.0.7
  - @reown/appkit-polyfills@1.0.7
  - @reown/appkit-siwe@1.0.7
  - @reown/appkit-ui@1.0.7
  - @reown/appkit-wallet@1.0.7

## 1.0.6

### Patch Changes

- [#2970](https://github.com/reown-com/appkit/pull/2970) [`e6a36a7`](https://github.com/reown-com/appkit/commit/e6a36a746e85ced1f89fc1d7227e25df1559f063) Thanks [@magiziz](https://github.com/magiziz)! - Introducing debug mode. This is useful for seeing UI alerts while debugging.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit/react'
  import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
  import { mainnet } from '@reown/appkit/networks'

  const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    networks: [mainnet],
    projectId: 'YOUR_PROJECT_ID'
  })

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [mainnet],
    projectId: 'YOUR_PROJECT_ID',
    debug: true // Optional - defaults to false
  })
  ```

- [#2984](https://github.com/reown-com/appkit/pull/2984) [`b5444bd`](https://github.com/reown-com/appkit/commit/b5444bdd454d370cf3f17267d457cd46de10a5b9) Thanks [@magiziz](https://github.com/magiziz)! - Changed logger imports to not cause the webpack bundler to throw a CommonJS module error.

- [#2974](https://github.com/reown-com/appkit/pull/2974) [`0563711`](https://github.com/reown-com/appkit/commit/05637111aba940af5f46215336268294675322fd) Thanks [@magiziz](https://github.com/magiziz)! - Added create wallet flow in connect modal

- Updated dependencies [[`e6a36a7`](https://github.com/reown-com/appkit/commit/e6a36a746e85ced1f89fc1d7227e25df1559f063), [`b5444bd`](https://github.com/reown-com/appkit/commit/b5444bdd454d370cf3f17267d457cd46de10a5b9), [`0563711`](https://github.com/reown-com/appkit/commit/05637111aba940af5f46215336268294675322fd)]:
  - @reown/appkit@1.0.6
  - @reown/appkit-utils@1.0.6
  - @reown/appkit-common@1.0.6
  - @reown/appkit-core@1.0.6
  - @reown/appkit-polyfills@1.0.6
  - @reown/appkit-scaffold-ui@1.0.6
  - @reown/appkit-siwe@1.0.6
  - @reown/appkit-ui@1.0.6
  - @reown/appkit-wallet@1.0.6

## 1.0.5

### Patch Changes

- [#2872](https://github.com/reown-com/appkit/pull/2872) [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513) Thanks [@zoruka](https://github.com/zoruka)! - Get correct data from session namespaces and set it for approved caip networks data on UniversalProvider usage"

- [#2937](https://github.com/reown-com/appkit/pull/2937) [`97dd79d`](https://github.com/reown-com/appkit/commit/97dd79df711201d5b7450fb10544f063975e6cb6) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates adapter packages dependency managements

- [#2919](https://github.com/reown-com/appkit/pull/2919) [`e2bacfd`](https://github.com/reown-com/appkit/commit/e2bacfd0aaa9a83060d3181678c42dd9cc90293b) Thanks [@zoruka](https://github.com/zoruka)! - Adds batched call for solana_signAllTransactions RPC call on Solana WalletConnectProvider

- [#2872](https://github.com/reown-com/appkit/pull/2872) [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513) Thanks [@zoruka](https://github.com/zoruka)! - Implement the correct logic for getting available networks when using universal provider

- [#2927](https://github.com/reown-com/appkit/pull/2927) [`865320c`](https://github.com/reown-com/appkit/commit/865320c709bb76a61ec88c786c6b2a354c8b4b8b) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors setting active CAIP address and aligns ethers5 adapter with ethers

- [#2920](https://github.com/reown-com/appkit/pull/2920) [`eeb9207`](https://github.com/reown-com/appkit/commit/eeb92079b4bb37d2cb9db68f51bcdeb87bd83af3) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: use usdt abi for usdt transactions

- [#2916](https://github.com/reown-com/appkit/pull/2916) [`cc35726`](https://github.com/reown-com/appkit/commit/cc357269ec04c6372c50d3bf00c674bfe182128b) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: override ens profile picture if resolved

- [#2934](https://github.com/reown-com/appkit/pull/2934) [`6faa782`](https://github.com/reown-com/appkit/commit/6faa7829c73b98430f1d8873bd9caf6c90046f2e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes swap amount calculation to prevent floating numbers

- [#2947](https://github.com/reown-com/appkit/pull/2947) [`bad570a`](https://github.com/reown-com/appkit/commit/bad570a9806785854cea4573cfb1e5bfb4e4a8fb) Thanks [@magiziz](https://github.com/magiziz)! - Replaced multi-account screen with single account screen when only one account is connected

- [#2944](https://github.com/reown-com/appkit/pull/2944) [`8baf998`](https://github.com/reown-com/appkit/commit/8baf998133d0bbab4f87f15a0337d4b1452912d7) Thanks [@tomiir](https://github.com/tomiir)! - Fix issue where wagmis useDisconnect hook would not disconnect appkit internally

- Updated dependencies [[`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513), [`97dd79d`](https://github.com/reown-com/appkit/commit/97dd79df711201d5b7450fb10544f063975e6cb6), [`e2bacfd`](https://github.com/reown-com/appkit/commit/e2bacfd0aaa9a83060d3181678c42dd9cc90293b), [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513), [`865320c`](https://github.com/reown-com/appkit/commit/865320c709bb76a61ec88c786c6b2a354c8b4b8b), [`eeb9207`](https://github.com/reown-com/appkit/commit/eeb92079b4bb37d2cb9db68f51bcdeb87bd83af3), [`cc35726`](https://github.com/reown-com/appkit/commit/cc357269ec04c6372c50d3bf00c674bfe182128b), [`6faa782`](https://github.com/reown-com/appkit/commit/6faa7829c73b98430f1d8873bd9caf6c90046f2e), [`bad570a`](https://github.com/reown-com/appkit/commit/bad570a9806785854cea4573cfb1e5bfb4e4a8fb), [`8baf998`](https://github.com/reown-com/appkit/commit/8baf998133d0bbab4f87f15a0337d4b1452912d7)]:
  - @reown/appkit@1.0.5
  - @reown/appkit-core@1.0.5
  - @reown/appkit-utils@1.0.5
  - @reown/appkit-common@1.0.5
  - @reown/appkit-polyfills@1.0.5
  - @reown/appkit-scaffold-ui@1.0.5
  - @reown/appkit-siwe@1.0.5
  - @reown/appkit-ui@1.0.5
  - @reown/appkit-wallet@1.0.5

## 1.0.4

### Patch Changes

- [#2907](https://github.com/reown-com/appkit/pull/2907) [`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where featured wallet ids were being filtered out if their connector was present but not displayed. eg. SDK Connectors.

- [#2882](https://github.com/reown-com/appkit/pull/2882) [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed deep link not working after connecting a wallet

- Updated dependencies [[`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd), [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b)]:
  - @reown/appkit-scaffold-ui@1.0.4
  - @reown/appkit@1.0.4
  - @reown/appkit-utils@1.0.4
  - @reown/appkit-common@1.0.4
  - @reown/appkit-core@1.0.4
  - @reown/appkit-polyfills@1.0.4
  - @reown/appkit-siwe@1.0.4
  - @reown/appkit-ui@1.0.4
  - @reown/appkit-wallet@1.0.4

## 1.0.3

### Patch Changes

- [#2897](https://github.com/reown-com/appkit/pull/2897) [`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d) Thanks [@tomiir](https://github.com/tomiir)! - Makes SDKType param optional

- [#2889](https://github.com/reown-com/appkit/pull/2889) [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Update siweParams with AppKit chains

- [#2888](https://github.com/reown-com/appkit/pull/2888) [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates active network state management and local storage controls

- Updated dependencies [[`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d), [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3), [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9)]:
  - @reown/appkit-wallet@1.0.3
  - @reown/appkit@1.0.3
  - @reown/appkit-utils@1.0.3
  - @reown/appkit-common@1.0.3
  - @reown/appkit-core@1.0.3
  - @reown/appkit-polyfills@1.0.3
  - @reown/appkit-scaffold-ui@1.0.3
  - @reown/appkit-siwe@1.0.3
  - @reown/appkit-ui@1.0.3

## 1.0.2

### Patch Changes

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where wagmi would not reconnect on an active session

- [#2867](https://github.com/reown-com/appkit/pull/2867) [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687) Thanks [@zoruka](https://github.com/zoruka)! - Refactors solana network and account syncing logic to clean up the code and fix missing project id for solana connection

- [#2879](https://github.com/reown-com/appkit/pull/2879) [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2) Thanks [@zoruka](https://github.com/zoruka)! - Add Solana CoinbaseWalletProvider to allow connecting with coinbase extension

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes wrong wagmi authConnector name causing issues when merging multiple authConnectors

- [#2861](https://github.com/reown-com/appkit/pull/2861) [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates the localstorage keys

- Updated dependencies [[`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687), [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2), [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1)]:
  - @reown/appkit-wallet@1.0.2
  - @reown/appkit-core@1.0.2
  - @reown/appkit@1.0.2
  - @reown/appkit-utils@1.0.2
  - @reown/appkit-common@1.0.2
  - @reown/appkit-polyfills@1.0.2
  - @reown/appkit-scaffold-ui@1.0.2
  - @reown/appkit-siwe@1.0.2
  - @reown/appkit-ui@1.0.2

## 1.0.1

### Patch Changes

- [#54](https://github.com/WalletConnect/web3modal/pull/54) [`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09) Thanks [@tomiir](https://github.com/tomiir)! - Makes packages public

- Updated dependencies [[`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09)]:
  - @reown/appkit@1.0.1
  - @reown/appkit-utils@1.0.1
  - @reown/appkit-common@1.0.1
  - @reown/appkit-core@1.0.1
  - @reown/appkit-polyfills@1.0.1
  - @reown/appkit-scaffold-ui@1.0.1
  - @reown/appkit-siwe@1.0.1
  - @reown/appkit-ui@1.0.1
  - @reown/appkit-wallet@1.0.1

## 1.0.0

### Major Changes

- [#53](https://github.com/WalletConnect/web3modal/pull/53) [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a) Thanks [@tomiir](https://github.com/tomiir)! - Reown v1.0.0

### Patch Changes

- [#49](https://github.com/WalletConnect/web3modal/pull/49) [`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates prop names, adapter names, network exported path name

- [#52](https://github.com/WalletConnect/web3modal/pull/52) [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6) Thanks [@zoruka](https://github.com/zoruka)! - Fix network availability and wagmi reconnect

- Updated dependencies [[`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f), [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6), [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a)]:
  - @reown/appkit-scaffold-ui@1.0.0
  - @reown/appkit@1.0.0
  - @reown/appkit-core@1.0.0
  - @reown/appkit-utils@1.0.0
  - @reown/appkit-common@1.0.0
  - @reown/appkit-polyfills@1.0.0
  - @reown/appkit-siwe@1.0.0
  - @reown/appkit-ui@1.0.0
  - @reown/appkit-wallet@1.0.0

## 0.0.5

### Patch Changes

- [#45](https://github.com/WalletConnect/web3modal/pull/45) [`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates RPC urls project id query params dynamically

- [#46](https://github.com/WalletConnect/web3modal/pull/46) [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates sdk type and sdk version values

- [#42](https://github.com/WalletConnect/web3modal/pull/42) [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04) Thanks [@tomiir](https://github.com/tomiir)! - Fix circular dependency in OptionsController

- Updated dependencies [[`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86), [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef), [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04)]:
  - @reown/appkit@0.0.5
  - @reown/appkit-common@0.0.5
  - @reown/appkit-utils@0.0.5
  - @reown/appkit-core@0.0.5
  - @reown/appkit-polyfills@0.0.5
  - @reown/appkit-scaffold-ui@0.0.5
  - @reown/appkit-siwe@0.0.5
  - @reown/appkit-ui@0.0.5
  - @reown/appkit-wallet@0.0.5

## 0.0.4

### Patch Changes

- [#38](https://github.com/WalletConnect/web3modal/pull/38) [`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b) Thanks [@tomiir](https://github.com/tomiir)! - Base reown package rename setup.

- Updated dependencies [[`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b)]:
  - @reown/appkit-utils@0.0.4
  - @reown/appkit-scaffold-ui@0.0.4
  - @reown/appkit-polyfills@0.0.4
  - @reown/appkit@0.0.4
  - @reown/appkit-common@0.0.4
  - @reown/appkit-wallet@0.0.4
  - @reown/appkit-core@0.0.4
  - @reown/appkit-siwe@0.0.4
  - @reown/appkit-ui@0.0.4

## 0.0.3

### Patch Changes

- [#28](https://github.com/WalletConnect/web3modal/pull/28) [`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797) Thanks [@tomiir](https://github.com/tomiir)! - Package setup. Reset Changelogs

- [#12](https://github.com/WalletConnect/web3modal/pull/12) [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a) Thanks [@tomiir](https://github.com/tomiir)! - Adds test vitest.workspace file

- Updated dependencies [[`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797), [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a)]:
  - @reown/appkit@0.0.3
  - @reown/appkit-common@0.0.3
  - @reown/appkit-core@0.0.3
  - @reown/appkit-polyfills@0.0.3
  - @reown/appkit-scaffold-ui@0.0.3
  - @reown/appkit-utils@0.0.3
  - @reown/appkit-siwe@0.0.3
  - @reown/appkit-ui@0.0.3
  - @reown/appkit-wallet@0.0.3
