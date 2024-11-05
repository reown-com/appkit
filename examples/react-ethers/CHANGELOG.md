# @examples/react-ethers

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
  - @reown/appkit-adapter-ethers@1.0.6
  - @reown/appkit@1.0.6

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
  - @reown/appkit-adapter-ethers@1.0.5

## 1.0.4

### Patch Changes

- [#2907](https://github.com/reown-com/appkit/pull/2907) [`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where featured wallet ids were being filtered out if their connector was present but not displayed. eg. SDK Connectors.

- [#2882](https://github.com/reown-com/appkit/pull/2882) [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed deep link not working after connecting a wallet

- Updated dependencies [[`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd), [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b)]:
  - @reown/appkit-adapter-ethers@1.0.4
  - @reown/appkit@1.0.4

## 1.0.3

### Patch Changes

- [#2897](https://github.com/reown-com/appkit/pull/2897) [`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d) Thanks [@tomiir](https://github.com/tomiir)! - Makes SDKType param optional

- [#2889](https://github.com/reown-com/appkit/pull/2889) [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Update siweParams with AppKit chains

- [#2888](https://github.com/reown-com/appkit/pull/2888) [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates active network state management and local storage controls

- Updated dependencies [[`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d), [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3), [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9)]:
  - @reown/appkit-adapter-ethers@1.0.3
  - @reown/appkit@1.0.3

## 1.0.2

### Patch Changes

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where wagmi would not reconnect on an active session

- [#2867](https://github.com/reown-com/appkit/pull/2867) [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687) Thanks [@zoruka](https://github.com/zoruka)! - Refactors solana network and account syncing logic to clean up the code and fix missing project id for solana connection

- [#2879](https://github.com/reown-com/appkit/pull/2879) [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2) Thanks [@zoruka](https://github.com/zoruka)! - Add Solana CoinbaseWalletProvider to allow connecting with coinbase extension

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes wrong wagmi authConnector name causing issues when merging multiple authConnectors

- [#2861](https://github.com/reown-com/appkit/pull/2861) [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates the localstorage keys

- Updated dependencies [[`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687), [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2), [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1)]:
  - @reown/appkit-adapter-ethers@1.0.2
  - @reown/appkit@1.0.2

## 1.0.1

### Patch Changes

- [#54](https://github.com/WalletConnect/web3modal/pull/54) [`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09) Thanks [@tomiir](https://github.com/tomiir)! - Makes packages public

- Updated dependencies [[`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09)]:
  - @reown/appkit-adapter-ethers@1.0.1
  - @reown/appkit@1.0.1

## 1.0.0

### Major Changes

- [#53](https://github.com/WalletConnect/web3modal/pull/53) [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a) Thanks [@tomiir](https://github.com/tomiir)! - Reown v1.0.0

### Patch Changes

- [#49](https://github.com/WalletConnect/web3modal/pull/49) [`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates prop names, adapter names, network exported path name

- [#52](https://github.com/WalletConnect/web3modal/pull/52) [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6) Thanks [@zoruka](https://github.com/zoruka)! - Fix network availability and wagmi reconnect

- Updated dependencies [[`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f), [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6), [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a)]:
  - @reown/appkit-adapter-ethers@1.0.0
  - @reown/appkit@1.0.0

## 0.0.5

### Patch Changes

- [#45](https://github.com/WalletConnect/web3modal/pull/45) [`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates RPC urls project id query params dynamically

- [#46](https://github.com/WalletConnect/web3modal/pull/46) [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates sdk type and sdk version values

- [#42](https://github.com/WalletConnect/web3modal/pull/42) [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04) Thanks [@tomiir](https://github.com/tomiir)! - Fix circular dependency in OptionsController

- Updated dependencies [[`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86), [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef), [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04)]:
  - @reown/appkit@0.0.5
  - @reown/appkit-adapter-ethers@0.0.5

## 0.0.4

### Patch Changes

- [#38](https://github.com/WalletConnect/web3modal/pull/38) [`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b) Thanks [@tomiir](https://github.com/tomiir)! - Base reown package rename setup.

- Updated dependencies [[`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b)]:
  - @reown/appkit-adapter-ethers@0.0.4
  - @reown/appkit@0.0.4

## 0.0.3

### Patch Changes

- [#28](https://github.com/WalletConnect/web3modal/pull/28) [`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797) Thanks [@tomiir](https://github.com/tomiir)! - Package setup. Reset Changelogs

- [#12](https://github.com/WalletConnect/web3modal/pull/12) [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a) Thanks [@tomiir](https://github.com/tomiir)! - Adds test vitest.workspace file

- Updated dependencies [[`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797), [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a)]:
  - @reown/appkit-adapter-ethers@0.0.3
  - @reown/appkit@0.0.3
