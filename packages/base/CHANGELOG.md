# @rerock/scaffold

## 5.1.6

### Patch Changes

- fix: update CSP by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2775
- fix: ethers5 adapter import in exports by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2754
- fix/missing action functions exports from clients by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2778
- fix: logics to set default chain by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2787
- Implement actions using userOpBuilder service instead of permissionless.js by @KannuSingh in https://github.com/WalletConnect/web3modal/pull/2758
- chore: run Playwright on self-hosted runners by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2788
- chore: add NEXT_PUBLIC_SECURE_SITE_SDK_URL to CSP by @tomiir in https://github.com/WalletConnect/web3modal/pull/2791
- chore: enable verify tests by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2774
- fix: social login shows `undefined` by @magiziz in https://github.com/WalletConnect/web3modal/pull/2783

* Updated dependencies []:
  - @rerock/common@5.1.6
  - @rerock/core@5.1.6
  - @rerock/polyfills@5.1.6
  - @rerock/scaffold-ui@5.1.6
  - @rerock/scaffold-utils@5.1.6
  - @rerock/siwe@5.1.6
  - @rerock/ui@5.1.6
  - @rerock/wallet@5.1.6

## 5.1.5

### Patch Changes

- - chore: add safety for localstorage by @zoruka in https://github.com/WalletConnect/web3modal/pull/2770
  - fix: impossible to press on send placeholder input on mobile by @magiziz in https://github.com/WalletConnect/web3modal/pull/2771
  - feat: solana sign all transactions by @zoruka in https://github.com/WalletConnect/web3modal/pull/2772
  - chore: change universal provider relay url and move to constants file by @zoruka in https://github.com/WalletConnect/web3modal/pull/2776
  - chore: remove coinbase SDK de-duplication by @tomiir in https://github.com/WalletConnect/web3modal/pull/2768
  - fix: add missing chainId param for transactions request by @zoruka in https://github.com/WalletConnect/web3modal/pull/2779
  - fix: remove coming message from solana transactions by @zoruka in https://github.com/WalletConnect/web3modal/pull/2780

- Updated dependencies []:
  - @rerock/scaffold-utils@5.1.5
  - @rerock/common@5.1.5
  - @rerock/core@5.1.5
  - @rerock/polyfills@5.1.5
  - @rerock/scaffold-ui@5.1.5
  - @rerock/siwe@5.1.5
  - @rerock/ui@5.1.5
  - @rerock/wallet@5.1.5

## 5.1.4

### Patch Changes

- - Added entries on assetlinks for flutter wallet by @quetool in https://github.com/WalletConnect/web3modal/pull/2746
  - chore: only upgrade ethers v6 by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2741
  - chore: fix wagmi not disconnecting and add adapter tests by @magiziz in https://github.com/WalletConnect/web3modal/pull/2751
  - Added more fingerprints to Flutter apps by @quetool in https://github.com/WalletConnect/web3modal/pull/2748
  - fix: remove auth connector from ethers and check for socials length by @tomiir in https://github.com/WalletConnect/web3modal/pull/2715
  - chore: make all socials enabled by default by @tomiir in https://github.com/WalletConnect/web3modal/pull/2747
  - fix: social logins not working in laboratory by @magiziz in https://github.com/WalletConnect/web3modal/pull/2765
  - chore: expose solana provider type by @zoruka in https://github.com/WalletConnect/web3modal/pull/2756
  - fix: Connector image mismatch by @tomiir in https://github.com/WalletConnect/web3modal/pull/2745
- Updated dependencies []:
  - @rerock/common@5.1.4
  - @rerock/core@5.1.4
  - @rerock/polyfills@5.1.4
  - @rerock/scaffold-ui@5.1.4
  - @rerock/scaffold-utils@5.1.4
  - @rerock/siwe@5.1.4
  - @rerock/ui@5.1.4
  - @rerock/wallet@5.1.4

## 5.1.3

### Patch Changes

- refactor: defaultChain ts mismatch, custom hooks, separation of dependencies

- Updated dependencies []:
  - @rerock/common@5.1.3
  - @rerock/core@5.1.3
  - @rerock/polyfills@5.1.3
  - @rerock/scaffold-ui@5.1.3
  - @rerock/scaffold-utils@5.1.3
  - @rerock/siwe@5.1.3
  - @rerock/ui@5.1.3
  - @rerock/wallet@5.1.3

## 5.1.2

### Patch Changes

- Added Solana Auth Provider types and schemas

- Updated dependencies []:
  - @rerock/scaffold-ui@5.1.2
  - @rerock/common@5.1.2
  - @rerock/core@5.1.2
  - @rerock/polyfills@5.1.2
  - @rerock/scaffold-utils@5.1.2
  - @rerock/siwe@5.1.2
  - @rerock/ui@5.1.2
  - @rerock/wallet@5.1.2

## 4.2.3

### Patch Changes

- feat: - feat: restricted ens names. fix: iat set automatically if not present in messageParams. Adds siwe config handlers

- Updated dependencies []:
  - @rerock/common@4.2.3
  - @rerock/core@4.2.3
  - @rerock/siwe@4.2.3
  - @rerock/ui@4.2.3
  - @rerock/wallet@4.2.3

## 4.2.3-alpha.0

### Patch Changes

- feat: add support for coinbase smart accounts

- Updated dependencies []:
  - @rerock/siwe@4.2.3-alpha.0
  - @rerock/common@4.2.3-alpha.0
  - @rerock/core@4.2.3-alpha.0
  - @rerock/ui@4.2.3-alpha.0
  - @rerock/wallet@4.2.3-alpha.0

## 4.2.2

### Patch Changes

- feat: social login refactor. wagmi sendCalls support. refactor theme variables

- Updated dependencies []:
  - @rerock/common@4.2.2
  - @rerock/core@4.2.2
  - @rerock/siwe@4.2.2
  - @rerock/ui@4.2.2
  - @rerock/wallet@4.2.2

## 4.2.1

### Patch Changes

- Hotfix to support injected and announced wallets in in app browsers

- Updated dependencies []:
  - @rerock/common@4.2.1
  - @rerock/core@4.2.1
  - @rerock/siwe@4.2.1
  - @rerock/ui@4.2.1
  - @rerock/wallet@4.2.1

## 4.2.0

### Patch Changes

- release: 4.2.0 version release

- Updated dependencies []:
  - @rerock/common@4.2.0
  - @rerock/core@4.2.0
  - @rerock/siwe@4.2.0
  - @rerock/ui@4.2.0
  - @rerock/wallet@4.2.0

## 4.2.0-alpha.0

### Patch Changes

- feat: 4.2.0-alpha release

- Updated dependencies []:
  - @rerock/common@4.2.0-alpha.0
  - @rerock/wallet@4.2.0-alpha.0
  - @rerock/core@4.2.0-alpha.0
  - @rerock/siwe@4.2.0-alpha.0
  - @rerock/ui@4.2.0-alpha.0

## 4.2.0-03e4f4a8.2

### Patch Changes

- fix: Issue with SIWE + Wagmi sign out. Fixes issue where signature verification fail resulted in empty open modal'

- Updated dependencies []:
  - @rerock/common@4.2.0-03e4f4a8.2
  - @rerock/wallet@4.2.0-03e4f4a8.2
  - @rerock/core@4.2.0-03e4f4a8.2
  - @rerock/siwe@4.2.0-03e4f4a8.2
  - @rerock/ui@4.2.0-03e4f4a8.2

## 4.2.0-448f7f4.1

### Minor Changes

- refactor: improvements to all features (siwe, send, swaps, ui and ux)

### Patch Changes

- Updated dependencies []:
  - @rerock/common@4.2.0-448f7f4.1
  - @rerock/core@4.2.0-448f7f4.1
  - @rerock/siwe@4.2.0-448f7f4.1
  - @rerock/ui@4.2.0-448f7f4.1
  - @rerock/wallet@4.2.0-448f7f4.1

## 4.1.12-910a844.0

### Patch Changes

- refactor: sync theme with secure site

- Updated dependencies []:
  - @rerock/common@4.1.12-910a844.0
  - @rerock/wallet@4.1.12-910a844.0
  - @rerock/core@4.1.12-910a844.0
  - @rerock/ui@4.1.12-910a844.0
  - @rerock/siwe@4.1.12-910a844.0

## 4.1.11

### Patch Changes

- refactor: Solana exported helper methods and proram instruction improvements
- refactor: email and smart account improvements
- refactor: unit test CI check improvements
- feat: convert

- Updated dependencies []:
  - @rerock/common@4.1.11
  - @rerock/core@4.1.11
  - @rerock/siwe@4.1.11
  - @rerock/ui@4.1.11
  - @rerock/wallet@4.1.11

## 4.1.10

### Patch Changes

- Fix activity list styling issue

- Updated dependencies []:
  - @rerock/common@4.1.10
  - @rerock/core@4.1.10
  - @rerock/siwe@4.1.10
  - @rerock/ui@4.1.10
  - @rerock/wallet@4.1.10

## 4.1.9

### Patch Changes

- Blockchain API fix

- Updated dependencies []:
  - @rerock/common@4.1.9
  - @rerock/core@4.1.9
  - @rerock/siwe@4.1.9
  - @rerock/ui@4.1.9
  - @rerock/wallet@4.1.9

## 4.1.8

### Patch Changes

- Hotfix for redundant tokenbalance calls

- Updated dependencies []:
  - @rerock/common@4.1.8
  - @rerock/core@4.1.8
  - @rerock/siwe@4.1.8
  - @rerock/ui@4.1.8
  - @rerock/wallet@4.1.8

## 4.1.7

### Patch Changes

- Hotfix for inccorect state of w3m-button when email is enabled

- Updated dependencies []:
  - @rerock/common@4.1.7
  - @rerock/core@4.1.7
  - @rerock/siwe@4.1.7
  - @rerock/ui@4.1.7
  - @rerock/wallet@4.1.7

## 4.1.6

### Patch Changes

- Fix modal default height. Fix ethers email connection lag. Fix ethers + rc relay disconnect issue. Adds new wui-components for secure site.

- Updated dependencies []:
  - @rerock/common@4.1.6
  - @rerock/core@4.1.6
  - @rerock/siwe@4.1.6
  - @rerock/ui@4.1.6
  - @rerock/wallet@4.1.6

## 4.1.6-a0733f5.0

### Patch Changes

- chore: canary release for siwe dependency

- Updated dependencies []:
  - @rerock/ethers@4.1.6-a0733f5.0
  - @rerock/siwe@4.1.6-a0733f5.0
  - @rerock/solana@4.1.6-a0733f5.0
  - @rerock/wagmi@4.1.6-a0733f5.0

## 4.1.5

### Patch Changes

- release: v4.1.5

- Updated dependencies []:
  - @rerock/common@4.1.5
  - @rerock/core@4.1.5
  - @rerock/siwe@4.1.5
  - @rerock/ui@4.1.5
  - @rerock/wallet@4.1.5

## 4.1.5-93c81127.0

### Patch Changes

- fix: polyfill process in wallet package

- Updated dependencies []:
  - @rerock/wallet@4.1.5-93c81127.0
  - @rerock/common@4.1.5-93c81127.0
  - @rerock/core@4.1.5-93c81127.0
  - @rerock/siwe@4.1.5-93c81127.0
  - @rerock/ui@4.1.5-93c81127.0

## 4.1.4

### Patch Changes

- feat: wallet info hook

- Updated dependencies []:
  - @rerock/common@4.1.4
  - @rerock/wallet@4.1.4
  - @rerock/core@4.1.4
  - @rerock/siwe@4.1.4
  - @rerock/ui@4.1.4

## 4.1.3

### Patch Changes

- feat: wallet info hook

- feat: reset version to 4.1.3

- Updated dependencies []:
  - @rerock/common@4.1.3
  - @rerock/core@4.1.3
  - @rerock/siwe@4.1.3
  - @rerock/ui@4.1.3
  - @rerock/wallet@4.1.3

## 4.1.3-5f2ae345.1

### Patch Changes

- canary: test imports

- Updated dependencies []:
  - @rerock/common@4.1.3-5f2ae345.1
  - @rerock/wallet@4.1.3-5f2ae345.1
  - @rerock/core@4.1.3-5f2ae345.1
  - @rerock/siwe@4.1.3-5f2ae345.1
  - @rerock/ui@4.1.3-5f2ae345.1

## 4.1.3-8e039e.0

### Patch Changes

- feat: update optional dependencies

- Updated dependencies []:
  - @rerock/common@4.1.3-8e039e.0
  - @rerock/wallet@4.1.3-8e039e.0
  - @rerock/core@4.1.3-8e039e.0
  - @rerock/siwe@4.1.3-8e039e.0
  - @rerock/ui@4.1.3-8e039e.0

## 4.1.2

### Patch Changes

- 4.1.2 release

- Updated dependencies []:
  - @rerock/common@4.1.2 - @rerock/core@4.1.2 - @rerock/siwe@4.1.2 - @rerock/ui@4.1.2 - @rerock/wallet@4.1.2

## 4.2.0-4b5257b4.1

### Minor Changes

- [#2052](https://github.com/WalletConnect/web3modal/pull/2052) [`1b90376`](https://github.com/WalletConnect/web3modal/commit/1b903765a675f0f1b9ea0a44bcf84e2dad6b4436) Thanks [@enesozturk](https://github.com/enesozturk)! - refactor: add missing extensions on imports

- feat: export solana chains from the solana package

- [#2052](https://github.com/WalletConnect/web3modal/pull/2052) [`729313f`](https://github.com/WalletConnect/web3modal/commit/729313fe9dfb402ca694cbd77f49cc61895e2d07) Thanks [@enesozturk](https://github.com/enesozturk)! - chore: new solana canary release

### Patch Changes

- Updated dependencies [[`1b90376`](https://github.com/WalletConnect/web3modal/commit/1b903765a675f0f1b9ea0a44bcf84e2dad6b4436), [`729313f`](https://github.com/WalletConnect/web3modal/commit/729313fe9dfb402ca694cbd77f49cc61895e2d07)]:
  - @rerock/wallet@4.2.0-4b5257b4.1
  - @rerock/core@4.2.0-4b5257b4.1
  - @rerock/ui@4.2.0-4b5257b4.1
  - @rerock/common@4.2.0-4b5257b4.1
  - @rerock/siwe@4.2.0-4b5257b4.1

## 4.2.0-dbbd8c44.0

### Minor Changes

- refactor: add missing extensions on imports

### Patch Changes

- Updated dependencies []:
  - @rerock/ui@4.2.0-dbbd8c44.0
  - @rerock/common@4.2.0-dbbd8c44.0

## 4.2.0-500a38.0

### Minor Changes

- feat: solana integration

### Patch Changes

- Updated dependencies []:
  - @rerock/wallet@4.2.0-500a38.0
  - @rerock/core@4.2.0-500a38.0
  - @rerock/ui@4.2.0-500a38.0
  - @rerock/common@4.2.0-500a38.0
  - @rerock/siwe@4.2.0-500a38.0

## 4.1.1

### Patch Changes

- Fix siwe version

- Updated dependencies []:
  - @rerock/siwe@4.1.1
  - @rerock/common@4.1.1
  - @rerock/core@4.1.1
  - @rerock/ui@4.1.1
  - @rerock/wallet@4.1.1

## 4.1.0

### Minor Changes

- Email Stable release

### Patch Changes

- Updated dependencies []:
  - @rerock/common@4.1.0
  - @rerock/core@4.1.0
  - @rerock/siwe@4.1.0
  - @rerock/ui@4.1.0

## 4.0.13

### Patch Changes

- Fix secure site url

- Updated dependencies []:
  - @rerock/common@4.0.13
  - @rerock/core@4.0.13
  - @rerock/siwe@4.0.13
  - @rerock/ui@4.0.13

## 4.0.12

### Patch Changes

- [#2014](https://github.com/WalletConnect/web3modal/pull/2014) [`95b35e1`](https://github.com/WalletConnect/web3modal/commit/95b35e1ebaf261a56a29cd9254d85b7c1430bfc0) Thanks [@tomiir](https://github.com/tomiir)! - Smart Account RPC handler canary

- Smart Account initialization and feature flag

- Updated dependencies [[`95b35e1`](https://github.com/WalletConnect/web3modal/commit/95b35e1ebaf261a56a29cd9254d85b7c1430bfc0)]:
  - @rerock/core@4.0.12
  - @rerock/ui@4.0.12
  - @rerock/common@4.0.12
  - @rerock/siwe@4.0.12

## 4.0.12-0c59f84f.0

### Patch Changes

- Smart Account RPC handler canary

- Updated dependencies []:
  - @rerock/core@4.0.12-0c59f84f.0
  - @rerock/ui@4.0.12-0c59f84f.0
  - @rerock/common@4.0.12-0c59f84f.0
  - @rerock/siwe@4.0.12-0c59f84f.0

## 4.0.11

### Patch Changes

- Analytics connection event improvements. Unsupported chain flag. Siwe package refactor. RPC improvements. UI improvements'

- Updated dependencies []:
  - @rerock/common@4.0.11
  - @rerock/core@4.0.11
  - @rerock/siwe@4.0.11
  - @rerock/ui@4.0.11

## 4.0.10

### Patch Changes

- Add error state to wui-chip composite

- Updated dependencies []:
  - @rerock/ui@4.0.10
  - @rerock/common@4.0.10
  - @rerock/core@4.0.10

## 4.0.9

### Patch Changes

- Add all rpc methods + auto reject when modal closes

- Updated dependencies []:
  - @rerock/common@4.0.9
  - @rerock/core@4.0.9
  - @rerock/ui@4.0.9

## 4.0.8

### Patch Changes

- [#1954](https://github.com/WalletConnect/web3modal/pull/1954) [`c3366e7`](https://github.com/WalletConnect/web3modal/commit/c3366e7211dba2f5c6d3377c9d9a77da5a52c0d8) Thanks [@tomiir](https://github.com/tomiir)! - Add support for eth_getBlockByNumber

- Updated dependencies [[`c3366e7`](https://github.com/WalletConnect/web3modal/commit/c3366e7211dba2f5c6d3377c9d9a77da5a52c0d8)]:
  - @rerock/common@4.0.8
  - @rerock/core@4.0.8
  - @rerock/ui@4.0.8

## 4.0.8-f1845392.0

### Patch Changes

- [#1954](https://github.com/WalletConnect/web3modal/pull/1954) [`4755109`](https://github.com/WalletConnect/web3modal/commit/475510962a92ea9f4388db1d08c979d99da18e54) Thanks [@tomiir](https://github.com/tomiir)! - Add support for eth_getBlockByNumber

- Updated dependencies [[`4755109`](https://github.com/WalletConnect/web3modal/commit/475510962a92ea9f4388db1d08c979d99da18e54)]:
  - @rerock/common@4.0.8-f1845392.0
  - @rerock/core@4.0.8-f1845392.0
  - @rerock/ui@4.0.8-f1845392.0

## 4.0.7

### Patch Changes

- Add eth_getBalance to list of allowed methods

- Updated dependencies []:
  - @rerock/common@4.0.7
  - @rerock/core@4.0.7
  - @rerock/ui@4.0.7

## 4.0.6

### Patch Changes

- Email stability fixes

- Updated dependencies []:
  - @rerock/common@4.0.6
  - @rerock/core@4.0.6
  - @rerock/ui@4.0.6

## 4.0.5

### Patch Changes

- [#1917](https://github.com/WalletConnect/web3modal/pull/1917) [`f79566c`](https://github.com/WalletConnect/web3modal/commit/f79566ca5119fa12795dd49fce01aea8e1a05d97) Thanks [@tomiir](https://github.com/tomiir)! - Replaces public url with blockchain api for supported networks

- Updated dependencies [[`f79566c`](https://github.com/WalletConnect/web3modal/commit/f79566ca5119fa12795dd49fce01aea8e1a05d97)]:
  - @rerock/common@4.0.5
  - @rerock/core@4.0.5
  - @rerock/ui@4.0.5

## 4.0.4

### Patch Changes

- Fix theming issue for email

- Updated dependencies []:
  - @rerock/core@4.0.4
  - @rerock/common@4.0.4
  - @rerock/ui@4.0.4

## 4.0.3

### Patch Changes

- Tag email beta, Sync Theme For Secure Wallet, Use manual version in constants

- Updated dependencies []:
  - @rerock/ui@4.0.3
  - @rerock/common@4.0.3
  - @rerock/core@4.0.3

## 4.0.2

### Patch Changes

- [#1899](https://github.com/WalletConnect/web3modal/pull/1899) [`42e97a0`](https://github.com/WalletConnect/web3modal/commit/42e97a04eb60090a821019ae80d62acacf35fc66) Thanks [@xzilja](https://github.com/xzilja)! - Reverted change that removed email update flow from account view

- Updated dependencies [[`42e97a0`](https://github.com/WalletConnect/web3modal/commit/42e97a04eb60090a821019ae80d62acacf35fc66)]:
  - @rerock/common@4.0.2
  - @rerock/core@4.0.2
  - @rerock/ui@4.0.2

## 4.0.1

### Patch Changes

- [#1879](https://github.com/WalletConnect/web3modal/pull/1879) [`e3fa353`](https://github.com/WalletConnect/web3modal/commit/e3fa35396e3d2b1153d12bfaf92738bc67b46640) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix various issues on ethers/ethers5 package

- Updated dependencies [[`e3fa353`](https://github.com/WalletConnect/web3modal/commit/e3fa35396e3d2b1153d12bfaf92738bc67b46640)]:
  - @rerock/common@4.0.1
  - @rerock/core@4.0.1
  - @rerock/ui@4.0.1
