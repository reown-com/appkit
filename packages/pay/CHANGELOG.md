# @reown/appkit-pay

## 1.7.11

### Patch Changes

- [#4509](https://github.com/reown-com/appkit/pull/4509) [`c0e7b37`](https://github.com/reown-com/appkit/commit/c0e7b370f6eaa7503a4e9eb68b3677084e5e7483) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on Bitcoin adapter where getActiveNetwork function get's network of other namespaces

- [#4518](https://github.com/reown-com/appkit/pull/4518) [`4c517ac`](https://github.com/reown-com/appkit/commit/4c517ac9ee245fa299db5c8f3956148e0d87fdd6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where if a wallet doesnt have rdns it could show up as a duplicate connector in connect screen

- [#4530](https://github.com/reown-com/appkit/pull/4530) [`269f621`](https://github.com/reown-com/appkit/commit/269f621b08d9cedd9176796df39499f196f8a23f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where closing modal instead of cancelling the request would cause desync with embedded wallet modal state

- [#4523](https://github.com/reown-com/appkit/pull/4523) [`7272728`](https://github.com/reown-com/appkit/commit/72727285c398cae29d3848c937a1c5c9d9ec5496) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue for the embedded wallet use case where switching network doesn't redirect AppKit back to previous screen

- [#4526](https://github.com/reown-com/appkit/pull/4526) [`1bef587`](https://github.com/reown-com/appkit/commit/1bef5871476467662d499747fa828583c3d0b52c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where AppKit would open sign message screen after it falls back to previous SIWE session

- [#4529](https://github.com/reown-com/appkit/pull/4529) [`96d8b3f`](https://github.com/reown-com/appkit/commit/96d8b3f6bc30380e350f4e2c62cd6b3504ca753b) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on swap transaction order on UI for image and descriptions

- [#4537](https://github.com/reown-com/appkit/pull/4537) [`e82d88b`](https://github.com/reown-com/appkit/commit/e82d88b88d5a5212c792d07063fad10dd5435c1b) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Viem and Wagmi dependencies

- [#4471](https://github.com/reown-com/appkit/pull/4471) [`ab4b093`](https://github.com/reown-com/appkit/commit/ab4b093d226aca7c5053001f1fdd3e13f7d68cc0) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue on the embedded wallet where rpc requests didn't target the correct chainId

- [#4501](https://github.com/reown-com/appkit/pull/4501) [`c7d293b`](https://github.com/reown-com/appkit/commit/c7d293b41c18a40c76e9cff793138e5adf53ff7e) Thanks [@tomiir](https://github.com/tomiir)! - Adds registerWalletStandard flag to allow automatic registration of WalletConnect relay connector as a Wallet Standard wallet

- [#4547](https://github.com/reown-com/appkit/pull/4547) [`52677fb`](https://github.com/reown-com/appkit/commit/52677fb5784c4f0da6454c2b4f0be6bc20330276) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where enableEIP6963 didn't result into the expected behaviour on wagmi adapter

- [#4553](https://github.com/reown-com/appkit/pull/4553) [`7b64297`](https://github.com/reown-com/appkit/commit/7b64297a47e1d8c9fa86490e01ba800825987512) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds `enableReconnect` flag to prevent automatic reconnection on initialization and page load.

  ### Example usage:

  ```jsx
  createAppKit({
    networks: [...],
    metadata: {...},
    enableReconnect: false // disables reconnection
  })
  ```

- [#4544](https://github.com/reown-com/appkit/pull/4544) [`47663ce`](https://github.com/reown-com/appkit/commit/47663ce7e7f7b1fcd26ba52b1d21f73b7048a27c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes a case where AppKit would stay in the wrong network when enableNetworkSwitch is disabled

- [#4552](https://github.com/reown-com/appkit/pull/4552) [`c5e0650`](https://github.com/reown-com/appkit/commit/c5e065028ce8ca3e88b3cd66962c5a19cf1808e9) Thanks [@magiziz](https://github.com/magiziz)! - Fixes issue where appkit.disconnect would not disconnect all namespaces when no parameter was provided

- [#4519](https://github.com/reown-com/appkit/pull/4519) [`4416586`](https://github.com/reown-com/appkit/commit/4416586acc1439ebdfdc29ff24c2426627dca5ed) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add version check script so devs get a warning if there is a mismatch between used appkit version

- [#4545](https://github.com/reown-com/appkit/pull/4545) [`b9fd168`](https://github.com/reown-com/appkit/commit/b9fd168a16733fbe5434e8aa8ab815430a45aff6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Sats Connect connectors (e.g Leather and Xverse) didn't appear in the connect modal after page load

- [#4554](https://github.com/reown-com/appkit/pull/4554) [`f3717ce`](https://github.com/reown-com/appkit/commit/f3717ce9d8acef53dba3794e386cb3f7695d2a72) Thanks [@tomiir](https://github.com/tomiir)! - Makes `chainId` optional in RPC requests

- Updated dependencies [[`c0e7b37`](https://github.com/reown-com/appkit/commit/c0e7b370f6eaa7503a4e9eb68b3677084e5e7483), [`4c517ac`](https://github.com/reown-com/appkit/commit/4c517ac9ee245fa299db5c8f3956148e0d87fdd6), [`269f621`](https://github.com/reown-com/appkit/commit/269f621b08d9cedd9176796df39499f196f8a23f), [`7272728`](https://github.com/reown-com/appkit/commit/72727285c398cae29d3848c937a1c5c9d9ec5496), [`1bef587`](https://github.com/reown-com/appkit/commit/1bef5871476467662d499747fa828583c3d0b52c), [`96d8b3f`](https://github.com/reown-com/appkit/commit/96d8b3f6bc30380e350f4e2c62cd6b3504ca753b), [`e82d88b`](https://github.com/reown-com/appkit/commit/e82d88b88d5a5212c792d07063fad10dd5435c1b), [`ab4b093`](https://github.com/reown-com/appkit/commit/ab4b093d226aca7c5053001f1fdd3e13f7d68cc0), [`c7d293b`](https://github.com/reown-com/appkit/commit/c7d293b41c18a40c76e9cff793138e5adf53ff7e), [`52677fb`](https://github.com/reown-com/appkit/commit/52677fb5784c4f0da6454c2b4f0be6bc20330276), [`7b64297`](https://github.com/reown-com/appkit/commit/7b64297a47e1d8c9fa86490e01ba800825987512), [`47663ce`](https://github.com/reown-com/appkit/commit/47663ce7e7f7b1fcd26ba52b1d21f73b7048a27c), [`c5e0650`](https://github.com/reown-com/appkit/commit/c5e065028ce8ca3e88b3cd66962c5a19cf1808e9), [`4416586`](https://github.com/reown-com/appkit/commit/4416586acc1439ebdfdc29ff24c2426627dca5ed), [`b9fd168`](https://github.com/reown-com/appkit/commit/b9fd168a16733fbe5434e8aa8ab815430a45aff6), [`f3717ce`](https://github.com/reown-com/appkit/commit/f3717ce9d8acef53dba3794e386cb3f7695d2a72)]:
  - @reown/appkit-utils@1.7.11
  - @reown/appkit-common@1.7.11
  - @reown/appkit-controllers@1.7.11
  - @reown/appkit-ui@1.7.11

## 1.7.10

### Patch Changes

- [#4510](https://github.com/reown-com/appkit/pull/4510) [`7227468`](https://github.com/reown-com/appkit/commit/7227468e72acff12fcfb281c83941bec4ec06b03) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the universal provider would hang forever if JWT verification failed during initialization

- [#4491](https://github.com/reown-com/appkit/pull/4491) [`0646651`](https://github.com/reown-com/appkit/commit/064665169d48c4c3456edf48f67ff25b3d07f678) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where SIWX sign message view was opening in One-Click-Auth flows

- [#4498](https://github.com/reown-com/appkit/pull/4498) [`0dfe08b`](https://github.com/reown-com/appkit/commit/0dfe08b3d4b9addb675445d22adb350fb5d18fc3) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where Global JSX namespace gets polluted, instead extend it

- [#4442](https://github.com/reown-com/appkit/pull/4442) [`255b3ac`](https://github.com/reown-com/appkit/commit/255b3ac1bbd649b05af310146f84ad3fd7b6898b) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add logic to fallback to previous SIWE session if request is canceled for current network

- Updated dependencies [[`7227468`](https://github.com/reown-com/appkit/commit/7227468e72acff12fcfb281c83941bec4ec06b03), [`0646651`](https://github.com/reown-com/appkit/commit/064665169d48c4c3456edf48f67ff25b3d07f678), [`0dfe08b`](https://github.com/reown-com/appkit/commit/0dfe08b3d4b9addb675445d22adb350fb5d18fc3), [`255b3ac`](https://github.com/reown-com/appkit/commit/255b3ac1bbd649b05af310146f84ad3fd7b6898b)]:
  - @reown/appkit-utils@1.7.10
  - @reown/appkit-controllers@1.7.10
  - @reown/appkit-common@1.7.10
  - @reown/appkit-ui@1.7.10

## 1.7.9

### Patch Changes

- [#4479](https://github.com/reown-com/appkit/pull/4479) [`c6eb67f`](https://github.com/reown-com/appkit/commit/c6eb67fe9f43fe889452f4f13030239bc23e1540) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes an issue on auth provider where it doesn't respect the last connected network and default to first available network of EVM adapter on page load

- [#4472](https://github.com/reown-com/appkit/pull/4472) [`8bff121`](https://github.com/reown-com/appkit/commit/8bff12156788762e56d5aaa3cefd19f3c06db937) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - increase wallet button coverage

- [#4466](https://github.com/reown-com/appkit/pull/4466) [`024a99d`](https://github.com/reown-com/appkit/commit/024a99dc650d950156378e77ec423d711a8f0004) Thanks [@tomiir](https://github.com/tomiir)! - Changes `wallet_addEthereumChain` behavior in wagmi to use the chain's original rpc url instead of blockchain API url

- [#4452](https://github.com/reown-com/appkit/pull/4452) [`dd3a7dd`](https://github.com/reown-com/appkit/commit/dd3a7ddb87eaf295f453c13ccba753897cccfbce) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix OKX Wallet Bitcoin issue where it was not able to connect properly in Bitcoin environments

- [#4455](https://github.com/reown-com/appkit/pull/4455) [`c2c1d78`](https://github.com/reown-com/appkit/commit/c2c1d78894283cf4d58fcdfc66c0f69a07fc9e91) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Updates Onramp provider sort

- [#4464](https://github.com/reown-com/appkit/pull/4464) [`a8fa4fb`](https://github.com/reown-com/appkit/commit/a8fa4fbdfb54cc185f656276929ea9635b07a4c0) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on WalletConnect connector is not reconnecting on page load

- [#4453](https://github.com/reown-com/appkit/pull/4453) [`87959b5`](https://github.com/reown-com/appkit/commit/87959b5990c15703854fe33f8123b73e5d61fe59) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on AppKit buttons with namespace where the correct account state is not being shown to the user on page load

- [#4478](https://github.com/reown-com/appkit/pull/4478) [`5201905`](https://github.com/reown-com/appkit/commit/52019051165de70aa5ce300f5ca51c189408f4f7) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on multichain where we are disconnecting namespaces if they are not in the WC connection's available namespaces

- [#4441](https://github.com/reown-com/appkit/pull/4441) [`00b2975`](https://github.com/reown-com/appkit/commit/00b2975fb57e67ab54c97b4154a90cc4715723b2) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors token balance util to use getAssets call only when using Auth provider

- [#4494](https://github.com/reown-com/appkit/pull/4494) [`352f41b`](https://github.com/reown-com/appkit/commit/352f41bfc53c257362efbe6067ac03dc8dd92ec4) Thanks [@zoruka](https://github.com/zoruka)! - Cloud Auth SIWX skip get sessions if token is not set

- Updated dependencies [[`8a42584`](https://github.com/reown-com/appkit/commit/8a425847216ef8660312c88f3f009e6f2ceb53ea), [`c6eb67f`](https://github.com/reown-com/appkit/commit/c6eb67fe9f43fe889452f4f13030239bc23e1540), [`8bff121`](https://github.com/reown-com/appkit/commit/8bff12156788762e56d5aaa3cefd19f3c06db937), [`024a99d`](https://github.com/reown-com/appkit/commit/024a99dc650d950156378e77ec423d711a8f0004), [`dd3a7dd`](https://github.com/reown-com/appkit/commit/dd3a7ddb87eaf295f453c13ccba753897cccfbce), [`c2c1d78`](https://github.com/reown-com/appkit/commit/c2c1d78894283cf4d58fcdfc66c0f69a07fc9e91), [`a8fa4fb`](https://github.com/reown-com/appkit/commit/a8fa4fbdfb54cc185f656276929ea9635b07a4c0), [`87959b5`](https://github.com/reown-com/appkit/commit/87959b5990c15703854fe33f8123b73e5d61fe59), [`5201905`](https://github.com/reown-com/appkit/commit/52019051165de70aa5ce300f5ca51c189408f4f7), [`00b2975`](https://github.com/reown-com/appkit/commit/00b2975fb57e67ab54c97b4154a90cc4715723b2), [`352f41b`](https://github.com/reown-com/appkit/commit/352f41bfc53c257362efbe6067ac03dc8dd92ec4)]:
  - @reown/appkit-utils@1.7.9
  - @reown/appkit-controllers@1.7.9
  - @reown/appkit-common@1.7.9
  - @reown/appkit-ui@1.7.9

## 1.7.8

### Patch Changes

- [#4394](https://github.com/reown-com/appkit/pull/4394) [`2171cb4`](https://github.com/reown-com/appkit/commit/2171cb4d2f36cc0203a6f42d7c7c7d9773f7656c) Thanks [@tomiir](https://github.com/tomiir)! - Makes CaipNetwork generic so that arbitrary namespaces can be used to create networks

- [#4433](https://github.com/reown-com/appkit/pull/4433) [`c8292f8`](https://github.com/reown-com/appkit/commit/c8292f89b6e607eb1ddaa8047ed32aa175bff70c) Thanks [@tomiir](https://github.com/tomiir)! - Adds automatic safe connector support to ethers and ethers5 clients

- [#4417](https://github.com/reown-com/appkit/pull/4417) [`c71afc1`](https://github.com/reown-com/appkit/commit/c71afc13362badd2d0c5eb9fa7453f2e1faffee4) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes issue where wagmi had a different chain state than AppKit

- [#4438](https://github.com/reown-com/appkit/pull/4438) [`d1fb3c8`](https://github.com/reown-com/appkit/commit/d1fb3c8c1a9c1cf7818806a725403838aec4a7c6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where getAccount doesn't return the embeddedWalletInfo

- [#4380](https://github.com/reown-com/appkit/pull/4380) [`30dbd46`](https://github.com/reown-com/appkit/commit/30dbd46897e69ccdd71e8722ff711aa0c1f28055) Thanks [@tomiir](https://github.com/tomiir)! - Adds Safe Apps SDK support by default on wagmi

- [#4410](https://github.com/reown-com/appkit/pull/4410) [`76c2ed6`](https://github.com/reown-com/appkit/commit/76c2ed68239f30b801de2d5ff05ced9b1442226a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors network switching logics on modal open where we shouldn't properly make AppKit switch network

- [#4413](https://github.com/reown-com/appkit/pull/4413) [`62fe412`](https://github.com/reown-com/appkit/commit/62fe412a6c618fca24826ab77b927bc6fdefde1a) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where we are adding wagmi connectors to our controllers double time which causes connection sync issues at some environments like Vue and causes performance issues

- [#4395](https://github.com/reown-com/appkit/pull/4395) [`38d44e7`](https://github.com/reown-com/appkit/commit/38d44e79cc753adf01becd64a39aa20cbe1504fa) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where some extension wallets would not be properly disconnected when requested via a hook.

- [#4432](https://github.com/reown-com/appkit/pull/4432) [`aa23b67`](https://github.com/reown-com/appkit/commit/aa23b671df3a0f30fb3ff11ff7deab2408144049) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes remote configs util getting email and social enabled for AppKit Basic

- [#4436](https://github.com/reown-com/appkit/pull/4436) [`2aa4ba2`](https://github.com/reown-com/appkit/commit/2aa4ba26cfc2c44f606f83ca24119887bc71c816) Thanks [@tomiir](https://github.com/tomiir)! - Adds support for Solflare wallet deeplinking in mobile environments

- Updated dependencies [[`2171cb4`](https://github.com/reown-com/appkit/commit/2171cb4d2f36cc0203a6f42d7c7c7d9773f7656c), [`c8292f8`](https://github.com/reown-com/appkit/commit/c8292f89b6e607eb1ddaa8047ed32aa175bff70c), [`c71afc1`](https://github.com/reown-com/appkit/commit/c71afc13362badd2d0c5eb9fa7453f2e1faffee4), [`d1fb3c8`](https://github.com/reown-com/appkit/commit/d1fb3c8c1a9c1cf7818806a725403838aec4a7c6), [`30dbd46`](https://github.com/reown-com/appkit/commit/30dbd46897e69ccdd71e8722ff711aa0c1f28055), [`76c2ed6`](https://github.com/reown-com/appkit/commit/76c2ed68239f30b801de2d5ff05ced9b1442226a), [`62fe412`](https://github.com/reown-com/appkit/commit/62fe412a6c618fca24826ab77b927bc6fdefde1a), [`38d44e7`](https://github.com/reown-com/appkit/commit/38d44e79cc753adf01becd64a39aa20cbe1504fa), [`aa23b67`](https://github.com/reown-com/appkit/commit/aa23b671df3a0f30fb3ff11ff7deab2408144049), [`2aa4ba2`](https://github.com/reown-com/appkit/commit/2aa4ba26cfc2c44f606f83ca24119887bc71c816)]:
  - @reown/appkit-utils@1.7.8
  - @reown/appkit-controllers@1.7.8
  - @reown/appkit-common@1.7.8
  - @reown/appkit-ui@1.7.8

## 1.7.7

### Patch Changes

- [#4396](https://github.com/reown-com/appkit/pull/4396) [`e215835`](https://github.com/reown-com/appkit/commit/e215835e83375f06a1bcbb4d863fb67d70981dda) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes W3mFrameProvider initialization without current chain id which causes network sync issues betwen AppKit and Secure site

- [#4386](https://github.com/reown-com/appkit/pull/4386) [`a64d13c`](https://github.com/reown-com/appkit/commit/a64d13c737003d83fc9bc0b2ee1ebfab6f0469be) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Solflare instead of Coinbase would be excepted from not having a mobile_link to be displayed in All Wallets

- [#4384](https://github.com/reown-com/appkit/pull/4384) [`bf2570d`](https://github.com/reown-com/appkit/commit/bf2570daa33a79b3994d53529780086017cce218) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add `chainId` to connectSocial app event to solve cases where user is connecting to the wrong network

- [#4361](https://github.com/reown-com/appkit/pull/4361) [`5b26c53`](https://github.com/reown-com/appkit/commit/5b26c53f186d5ddf8d45fb8bf709fe3aa0adc8c2) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where auth provider's switch network is not getting called when switching to different namespace if that namespace is already connected before

- [#4408](https://github.com/reown-com/appkit/pull/4408) [`50bcf53`](https://github.com/reown-com/appkit/commit/50bcf53725a14baaf3445ddb7a5340564c821be4) Thanks [@tomiir](https://github.com/tomiir)! - fix: issue where wagmi would not clear connections properly in vue mobile contexts

- [#4404](https://github.com/reown-com/appkit/pull/4404) [`08f4981`](https://github.com/reown-com/appkit/commit/08f49817d6d74dec10f3cb1d0f21a74e85a5f026) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes an issue that can be seen on embedded mode where we are redirecting user to connect page instead of account page after connection

- [#4374](https://github.com/reown-com/appkit/pull/4374) [`d0d0c05`](https://github.com/reown-com/appkit/commit/d0d0c053c0178da81be7e55ab8d11125f8ca3f9a) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Updates SIWX message text to handle network name from CAIP network id

- [#4389](https://github.com/reown-com/appkit/pull/4389) [`974db88`](https://github.com/reown-com/appkit/commit/974db88133df3f98a38eaeeaab8eecd512c32ef9) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Fix modal closing on unsupported chain selection

- [#4392](https://github.com/reown-com/appkit/pull/4392) [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37) Thanks [@tomiir](https://github.com/tomiir)! - Simplifies routing logic to replace multiple parameters with callbacks for error success and cancel

- [#4318](https://github.com/reown-com/appkit/pull/4318) [`43e5a9d`](https://github.com/reown-com/appkit/commit/43e5a9d4f9e38f2b7da2c5bfe6166f62d18cc51c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add remote features configuration handling

- [#4392](https://github.com/reown-com/appkit/pull/4392) [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where ENS registration due to signature expiration error would result in modal closing without error message.

- [#4381](https://github.com/reown-com/appkit/pull/4381) [`6c12c21`](https://github.com/reown-com/appkit/commit/6c12c217eed139e2468d8d13f99dbc6af0f80947) Thanks [@tomiir](https://github.com/tomiir)! - Modified the fetchFeaturedWallets() function in ApiController.ts to create a new sorted array instead of sorting the array in place, ensuring the wallet order is preserved.

- [#4385](https://github.com/reown-com/appkit/pull/4385) [`e33b28f`](https://github.com/reown-com/appkit/commit/e33b28fc64401471f6a2fe908ea365409122af18) Thanks [@tomiir](https://github.com/tomiir)! - Adds externalCustomerId to meld url

- Updated dependencies [[`e215835`](https://github.com/reown-com/appkit/commit/e215835e83375f06a1bcbb4d863fb67d70981dda), [`a64d13c`](https://github.com/reown-com/appkit/commit/a64d13c737003d83fc9bc0b2ee1ebfab6f0469be), [`bf2570d`](https://github.com/reown-com/appkit/commit/bf2570daa33a79b3994d53529780086017cce218), [`5b26c53`](https://github.com/reown-com/appkit/commit/5b26c53f186d5ddf8d45fb8bf709fe3aa0adc8c2), [`50bcf53`](https://github.com/reown-com/appkit/commit/50bcf53725a14baaf3445ddb7a5340564c821be4), [`08f4981`](https://github.com/reown-com/appkit/commit/08f49817d6d74dec10f3cb1d0f21a74e85a5f026), [`d0d0c05`](https://github.com/reown-com/appkit/commit/d0d0c053c0178da81be7e55ab8d11125f8ca3f9a), [`974db88`](https://github.com/reown-com/appkit/commit/974db88133df3f98a38eaeeaab8eecd512c32ef9), [`8539b68`](https://github.com/reown-com/appkit/commit/8539b68de2acb9e9a75f719cefa128c88185567b), [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37), [`43e5a9d`](https://github.com/reown-com/appkit/commit/43e5a9d4f9e38f2b7da2c5bfe6166f62d18cc51c), [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37), [`6c12c21`](https://github.com/reown-com/appkit/commit/6c12c217eed139e2468d8d13f99dbc6af0f80947), [`e33b28f`](https://github.com/reown-com/appkit/commit/e33b28fc64401471f6a2fe908ea365409122af18)]:
  - @reown/appkit-utils@1.7.7
  - @reown/appkit-common@1.7.7
  - @reown/appkit-controllers@1.7.7
  - @reown/appkit-ui@1.7.7

## 1.7.6

### Patch Changes

- [#4353](https://github.com/reown-com/appkit/pull/4353) [`3b74f1f`](https://github.com/reown-com/appkit/commit/3b74f1fef5a4498634cc744c37e05dbb7f2e2075) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Enaple Solana in AppKit Pay

- [#4347](https://github.com/reown-com/appkit/pull/4347) [`442b1fa`](https://github.com/reown-com/appkit/commit/442b1fa5211af3aaf8c3dfa4f0c2b39ffd740a60) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes chain parameter from the excluded wallets fetch request to not filter wallets by supported networks

- Updated dependencies [[`3b74f1f`](https://github.com/reown-com/appkit/commit/3b74f1fef5a4498634cc744c37e05dbb7f2e2075), [`442b1fa`](https://github.com/reown-com/appkit/commit/442b1fa5211af3aaf8c3dfa4f0c2b39ffd740a60)]:
  - @reown/appkit-utils@1.7.6
  - @reown/appkit-common@1.7.6
  - @reown/appkit-controllers@1.7.6
  - @reown/appkit-ui@1.7.6

## 1.7.5

### Patch Changes

- [#4300](https://github.com/reown-com/appkit/pull/4300) [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where wallets without a valid mobile_link were listed on mobile devices

- [#4320](https://github.com/reown-com/appkit/pull/4320) [`997b6fc`](https://github.com/reown-com/appkit/commit/997b6fc20f73ba68f8815c659f3cae03de90d3c8) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Enable analytics for Pay feature

- [#4324](https://github.com/reown-com/appkit/pull/4324) [`a26ea94`](https://github.com/reown-com/appkit/commit/a26ea9498f21d5419e9c7fa0cc567bc5d04a5173) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Fixes wui-ux-by-reown to make it always displayed

- [#4313](https://github.com/reown-com/appkit/pull/4313) [`45025fc`](https://github.com/reown-com/appkit/commit/45025fc0d88444adad422ef219bea19ff8f98596) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade all dependencies with minor and patch updates

- [#4300](https://github.com/reown-com/appkit/pull/4300) [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where excludeWalletIds would not be properly set on api requests.

- [#4311](https://github.com/reown-com/appkit/pull/4311) [`a3c2f6c`](https://github.com/reown-com/appkit/commit/a3c2f6c9630ae1166383d850b79626a994b84821) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - This PR fixes an issue where the auth connector would override the previous account state when switching network (switching on auth connector in stead of using the already existing account state (with different provider)

- [#4312](https://github.com/reown-com/appkit/pull/4312) [`320fe23`](https://github.com/reown-com/appkit/commit/320fe2300481da1b5b0aeff74d88fa44b5bff03a) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies to latest

- [#4315](https://github.com/reown-com/appkit/pull/4315) [`1d6fa26`](https://github.com/reown-com/appkit/commit/1d6fa26731a5a47bea1d242cfdb59a17a4de42d0) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug where wagmi adapter wasn't using the dedicated `.getProvider()` api but a custom `.provider` prop which is unreliable in getting the provider

- [#4337](https://github.com/reown-com/appkit/pull/4337) [`e206f97`](https://github.com/reown-com/appkit/commit/e206f97ac30fafc507ffcfc765b2fca4f617e965) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would be wrongly synced in wagmi on refresh

- [#4341](https://github.com/reown-com/appkit/pull/4341) [`2feefeb`](https://github.com/reown-com/appkit/commit/2feefebeaab3e47baf2f3b3b189ed90d9f6e7ddd) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where defaultAccountTypes would not be respected

- [#4301](https://github.com/reown-com/appkit/pull/4301) [`2fb24ad`](https://github.com/reown-com/appkit/commit/2fb24ad36544ba9ca51d1504d10ea60a5abfd2e1) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where balance would not be properly updated after a send flow transaction'

- [#4340](https://github.com/reown-com/appkit/pull/4340) [`0405ab5`](https://github.com/reown-com/appkit/commit/0405ab5949092be4bcf9fb08190e15cdbb74460e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Phantom mobile wallet redirection for EVM/Bitcoin chains

- [#4344](https://github.com/reown-com/appkit/pull/4344) [`d4dc6c8`](https://github.com/reown-com/appkit/commit/d4dc6c89cd6abf8e355fc0f7fb7063df6b32d592) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Add asset metadata to exchange fetching so the data can be preemptively filtered based on the supported asset

- [#4246](https://github.com/reown-com/appkit/pull/4246) [`0379974`](https://github.com/reown-com/appkit/commit/0379974137cb0a28f75220bd3c77d0ae35fd43c2) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade Solana packages to latest

- [#4348](https://github.com/reown-com/appkit/pull/4348) [`72f4658`](https://github.com/reown-com/appkit/commit/72f4658597bb9c15b94836cc3be4fa2078b1e163) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes send flow address input logic where it's not responding the given input as expected

- [#4342](https://github.com/reown-com/appkit/pull/4342) [`c0a6ae8`](https://github.com/reown-com/appkit/commit/c0a6ae8ec385748f1b6f376ab80be12bd12e6810) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes connected wallet info state where it's using connector id when connector or provider is not found

- [#4303](https://github.com/reown-com/appkit/pull/4303) [`33b3693`](https://github.com/reown-com/appkit/commit/33b36933ab36f03bf060e5d9a1ad8f036ccfdee5) Thanks [@tomiir](https://github.com/tomiir)! - Adds try catch preventing error from bubbling up if fetching supported networks for Blockchain API fails'

- [#4294](https://github.com/reown-com/appkit/pull/4294) [`d23248f`](https://github.com/reown-com/appkit/commit/d23248fd68eaf6641bd3f1251e1e5a6df1e2e9c5) Thanks [@enesozturk](https://github.com/enesozturk)! - Calls Universal Link if the deeplink call is not worked as expected and UL is exist

- Updated dependencies [[`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff), [`997b6fc`](https://github.com/reown-com/appkit/commit/997b6fc20f73ba68f8815c659f3cae03de90d3c8), [`a26ea94`](https://github.com/reown-com/appkit/commit/a26ea9498f21d5419e9c7fa0cc567bc5d04a5173), [`45025fc`](https://github.com/reown-com/appkit/commit/45025fc0d88444adad422ef219bea19ff8f98596), [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff), [`a3c2f6c`](https://github.com/reown-com/appkit/commit/a3c2f6c9630ae1166383d850b79626a994b84821), [`320fe23`](https://github.com/reown-com/appkit/commit/320fe2300481da1b5b0aeff74d88fa44b5bff03a), [`5018edf`](https://github.com/reown-com/appkit/commit/5018edfea07ac55e143215182a07cdd84901306f), [`1d6fa26`](https://github.com/reown-com/appkit/commit/1d6fa26731a5a47bea1d242cfdb59a17a4de42d0), [`e206f97`](https://github.com/reown-com/appkit/commit/e206f97ac30fafc507ffcfc765b2fca4f617e965), [`2feefeb`](https://github.com/reown-com/appkit/commit/2feefebeaab3e47baf2f3b3b189ed90d9f6e7ddd), [`2fb24ad`](https://github.com/reown-com/appkit/commit/2fb24ad36544ba9ca51d1504d10ea60a5abfd2e1), [`0405ab5`](https://github.com/reown-com/appkit/commit/0405ab5949092be4bcf9fb08190e15cdbb74460e), [`d4dc6c8`](https://github.com/reown-com/appkit/commit/d4dc6c89cd6abf8e355fc0f7fb7063df6b32d592), [`0379974`](https://github.com/reown-com/appkit/commit/0379974137cb0a28f75220bd3c77d0ae35fd43c2), [`72f4658`](https://github.com/reown-com/appkit/commit/72f4658597bb9c15b94836cc3be4fa2078b1e163), [`e7d3e71`](https://github.com/reown-com/appkit/commit/e7d3e71d72625e057d94b3768438b29a8b6f530e), [`c0a6ae8`](https://github.com/reown-com/appkit/commit/c0a6ae8ec385748f1b6f376ab80be12bd12e6810), [`33b3693`](https://github.com/reown-com/appkit/commit/33b36933ab36f03bf060e5d9a1ad8f036ccfdee5), [`d23248f`](https://github.com/reown-com/appkit/commit/d23248fd68eaf6641bd3f1251e1e5a6df1e2e9c5)]:
  - @reown/appkit-controllers@1.7.5
  - @reown/appkit-utils@1.7.5
  - @reown/appkit-common@1.7.5
  - @reown/appkit-ui@1.7.5

## 1.6.10

### Patch Changes

- [#4296](https://github.com/reown-com/appkit/pull/4296) [`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where social login was not working in PWA environments

- [#4281](https://github.com/reown-com/appkit/pull/4281) [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7) Thanks [@magiziz](https://github.com/magiziz)! - Added cosmos namespace

- [#4287](https://github.com/reown-com/appkit/pull/4287) [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where embeddedWalletInfo would be populated even when connected to non-embedded wallets

- [#4260](https://github.com/reown-com/appkit/pull/4260) [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Receive screen would show networks from other namespaces

- [#4279](https://github.com/reown-com/appkit/pull/4279) [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades sats-connect for network switching while connecting

- [#4299](https://github.com/reown-com/appkit/pull/4299) [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where deep links on mobile were not working properly

- [#4288](https://github.com/reown-com/appkit/pull/4288) [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would not be set on initial connection

- [#4291](https://github.com/reown-com/appkit/pull/4291) [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Open loading screen from the secure site for better UX in stead of opening blank screen

- [#4297](https://github.com/reown-com/appkit/pull/4297) [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Solely use the BlockChain API to make ENS calls. Removed all the adapter specific logic to retrieve the ENS name, address and avatar

- [#4283](https://github.com/reown-com/appkit/pull/4283) [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the "Get Started" button appeared in the connect view when both email and socials were disabled

- [#4292](https://github.com/reown-com/appkit/pull/4292) [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies to 2.20.x

- [#4290](https://github.com/reown-com/appkit/pull/4290) [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes gas estimations from swap inputs and calculations

- Updated dependencies [[`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef), [`f2f1b72`](https://github.com/reown-com/appkit/commit/f2f1b72387a7658abd6e8c3061c51e9811e8ce69), [`ce17d19`](https://github.com/reown-com/appkit/commit/ce17d19a7e26eb3bc1de7ecd4928dedef6b99c66), [`00caf22`](https://github.com/reown-com/appkit/commit/00caf227b84476ab45e317b48f8a31bd14e48e78), [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7), [`f91ec17`](https://github.com/reown-com/appkit/commit/f91ec1770fdada058a658b62bd3f8f7bea00322e), [`531da97`](https://github.com/reown-com/appkit/commit/531da979c89c3727ac3e190f709c6bd2dba8215c), [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2), [`f6bddff`](https://github.com/reown-com/appkit/commit/f6bddffe8cea2d6696a6dd98ec8a57c17c6a02ac), [`bc0f260`](https://github.com/reown-com/appkit/commit/bc0f260beac036571c6e820953e69d14e087048b), [`4aeb703`](https://github.com/reown-com/appkit/commit/4aeb703fc5bc44cfc6cb34b43758eb3fbb8ab005), [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85), [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa), [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca), [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27), [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440), [`a775335`](https://github.com/reown-com/appkit/commit/a775335b37e2080b3a181e57ccafda3dd196b836), [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542), [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce), [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93), [`fae99c0`](https://github.com/reown-com/appkit/commit/fae99c0c160d62ca4e87716dedc91de2c4fdbd4e), [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b)]:
  - @reown/appkit-controllers@1.7.4
  - @reown/appkit-utils@1.7.4
  - @reown/appkit-common@1.7.4
  - @reown/appkit-ui@1.7.4
