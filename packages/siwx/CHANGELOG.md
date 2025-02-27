# @reown/appkit-siwx

## 1.6.9

### Patch Changes

- [#3878](https://github.com/reown-com/appkit/pull/3878) [`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where social popup window was blocked by safari

- [#3818](https://github.com/reown-com/appkit/pull/3818) [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad) Thanks [@enesozturk](https://github.com/enesozturk)! - Allows getting chain specific account data with hooks and subscribe methods

  ### Example Usage

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  const accountState = useAppKitAccount() // Returns active chain's account state
  const evmAccountState = useAppKitAccount({ chainNamespace: 'eip155' }) // Returns EVM chain's account state
  const solanaAccountState = useAppKitAccount({ chainNamespace: 'solana' }) // Returns Solana chain's account state
  const bitcoinAccountState = useAppKitAccount({ chainNamespace: 'bip122' }) // Returns Bitcoin chain's account state
  ```

- [#3764](https://github.com/reown-com/appkit/pull/3764) [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400) Thanks [@magiziz](https://github.com/magiziz)! - Deprecated api headers to use query parameters

- [#3833](https://github.com/reown-com/appkit/pull/3833) [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Set wallet to undefined after unmount of QR view

- [#3832](https://github.com/reown-com/appkit/pull/3832) [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add error message to SEND_ERROR event

- [#3864](https://github.com/reown-com/appkit/pull/3864) [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Applied a fix where we correctly clear the wallet state

- [#3895](https://github.com/reown-com/appkit/pull/3895) [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b) Thanks [@magiziz](https://github.com/magiziz)! - Add await in switchNetwork

- [#3869](https://github.com/reown-com/appkit/pull/3869) [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes defaultNetwork prop that is not being used on initialization

- [#3785](https://github.com/reown-com/appkit/pull/3785) [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58) Thanks [@magiziz](https://github.com/magiziz)! - Added support for react version 19

- [#3847](https://github.com/reown-com/appkit/pull/3847) [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where switching to an unrecognized chain in MM mobile resulted in INVALID_CHAIN error which was not parsed for wallet_addEthereumChain request

- [#3870](https://github.com/reown-com/appkit/pull/3870) [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4) Thanks [@zoruka](https://github.com/zoruka)! - Add extra metadata about connected wallet sent to cloud auth siwx

- [#3917](https://github.com/reown-com/appkit/pull/3917) [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where wagmi is not getting the correct session state

- [#3910](https://github.com/reown-com/appkit/pull/3910) [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca) Thanks [@tomiir](https://github.com/tomiir)! - Adds st and sv params to identity call on Blockchain Api

- [#3881](https://github.com/reown-com/appkit/pull/3881) [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes fetch identity call where if the network is not supported by wallet and if switched to another network

- [#3876](https://github.com/reown-com/appkit/pull/3876) [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin support for wallet buttons

- [#3868](https://github.com/reown-com/appkit/pull/3868) [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b) Thanks [@tomiir](https://github.com/tomiir)! - Sets default chain to current appkit chain on WC connections

- Updated dependencies [[`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6), [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad), [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400), [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e), [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20), [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87), [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b), [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118), [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58), [`573bdfc`](https://github.com/reown-com/appkit/commit/573bdfcb7bc86f3385a2151d7a3e854c22804ea1), [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71), [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4), [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821), [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca), [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e), [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3), [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b)]:
  - @reown/appkit-utils@1.6.9
  - @reown/appkit-common@1.6.9
  - @reown/appkit-core@1.6.9

## 1.6.8

### Patch Changes

- [#3828](https://github.com/reown-com/appkit/pull/3828) [`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Wagmi, Viem and Coinbase Wallet SDK deps

- Updated dependencies [[`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794)]:
  - @reown/appkit-common@1.6.8
  - @reown/appkit-core@1.6.8

## 1.6.7

### Patch Changes

- [#3820](https://github.com/reown-com/appkit/pull/3820) [`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where the modal doesn't recognize a difference between modal and wallet active network which causes issues when doing wallet actions"

- Updated dependencies [[`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6)]:
  - @reown/appkit-core@1.6.7
  - @reown/appkit-common@1.6.7

## 1.6.6

### Patch Changes

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors extendCaipNetwork util function to not override it if already extended

- [#3751](https://github.com/reown-com/appkit/pull/3751) [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c) Thanks [@zoruka](https://github.com/zoruka)! - Upgrade `@walletconnect/*` packages to `2.18.x`

- [#3736](https://github.com/reown-com/appkit/pull/3736) [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5) Thanks [@tomiir](https://github.com/tomiir)! - Adds address field to analytics event

- [#3776](https://github.com/reown-com/appkit/pull/3776) [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors get month by index method

- [#3787](https://github.com/reown-com/appkit/pull/3787) [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Don't render browser tabs on AppKit Basic

- [#3760](https://github.com/reown-com/appkit/pull/3760) [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb) Thanks [@magiziz](https://github.com/magiziz)! - Improved wallet image loading by fetching them only when the modal is opened instead of on page load.

- [#3738](https://github.com/reown-com/appkit/pull/3738) [`951cc29`](https://github.com/reown-com/appkit/commit/951cc298932bd69c9875b5752154fbfe11624b9a) Thanks [@Nithishvb](https://github.com/Nithishvb)! - Resolved import errors for `SIWXVerifier`, `SIWXStorage`, and `SIWXMessenger` in the `@reown/appkit-siwx` package.

- [#3754](https://github.com/reown-com/appkit/pull/3754) [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes SIWE package dependency from AppKit main package

- [#3782](https://github.com/reown-com/appkit/pull/3782) [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades third party dependencies

- [#3766](https://github.com/reown-com/appkit/pull/3766) [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes subscribeAccount where it needs to listen ConnectorController changes while returning account state

- [#3746](https://github.com/reown-com/appkit/pull/3746) [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c) Thanks [@enesozturk](https://github.com/enesozturk)! - Remove ontouchstart events from buttons

- [#3768](https://github.com/reown-com/appkit/pull/3768) [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Replace bignumber for big.js

- [#3786](https://github.com/reown-com/appkit/pull/3786) [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add logic to correctly switch chains in universalAdapter

- [#3727](https://github.com/reown-com/appkit/pull/3727) [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where signing was not working when switching chains using WalletConnect with ethers/ethers5 adapters.

- [#3752](https://github.com/reown-com/appkit/pull/3752) [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors syncConnectors to dynamically import Coinbase Wallet SDK

- [#3775](https://github.com/reown-com/appkit/pull/3775) [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors Universal Link handling for Solana wallets to use explicit user action

- [#3771](https://github.com/reown-com/appkit/pull/3771) [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435) Thanks [@enesozturk](https://github.com/enesozturk)! - Filters connectors when switching to another namespace after connecting to one

- [#3724](https://github.com/reown-com/appkit/pull/3724) [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds network add/remove methods for dynamically setting networks

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit initialize function to separate initializing Pulse event and uses anonymous function for display_uri callback

- [#3798](https://github.com/reown-com/appkit/pull/3798) [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9) Thanks [@tomiir](https://github.com/tomiir)! - Re-expose rotated meld key to prevent key mismatches on onramp flows

- [#3784](https://github.com/reown-com/appkit/pull/3784) [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes add remove network function logics to prevent duplications

- [#3790](https://github.com/reown-com/appkit/pull/3790) [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829) Thanks [@tomiir](https://github.com/tomiir)! - Replaces blockchain api requests for balance with native balance requests

- Updated dependencies [[`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c), [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5), [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e), [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17), [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb), [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f), [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae), [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa), [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c), [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40), [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984), [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d), [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e), [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff), [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435), [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c), [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9), [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176), [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829)]:
  - @reown/appkit-common@1.6.6
  - @reown/appkit-core@1.6.6

## 1.6.5

### Patch Changes

- [#3523](https://github.com/reown-com/appkit/pull/3523) [`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8) Thanks [@zoruka](https://github.com/zoruka)! - Abstracts Connectors management in Solana Adapter

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where mobile view would show auth login options without adapters

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors network switching when trying to use auth connector but active network is not supported by auth connector

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connector rendering logics when add/remove adapters for email/social login

- [#3638](https://github.com/reown-com/appkit/pull/3638) [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde) Thanks [@zoruka](https://github.com/zoruka)! - Fix condition for unsupported chain for `chainChanged` event on wallet connect event

- [#3637](https://github.com/reown-com/appkit/pull/3637) [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a) Thanks [@zoruka](https://github.com/zoruka)! - Add default value if namespace is not available on upa getAccounts

- [#3721](https://github.com/reown-com/appkit/pull/3721) [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes listening `ChainController.state.noAdapters` and `OptionsController.state.features` while enable/disable auth options dynamically

- [#3639](https://github.com/reown-com/appkit/pull/3639) [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3) Thanks [@zoruka](https://github.com/zoruka)! - Fix BitcoinAdapter `switchNetwork` function execution

- [#3621](https://github.com/reown-com/appkit/pull/3621) [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when on testnets

- [#3691](https://github.com/reown-com/appkit/pull/3691) [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc) Thanks [@magiziz](https://github.com/magiziz)! - Expanded more views in the modal open function to include Swap, Send, Wallet Is a Wallet, Wallet Is a Network and All Wallets screens.

  **Example usage**

  ```tsx
  import { createAppKit } from '@reown/appkit'

  const VIEWS = [
    { label: 'Open "On-Ramp" modal view', view: 'Swap' },
    { label: 'Open "Send" modal view', view: 'WalletSend' },
    { label: 'Open "What Is a Wallet?" modal view', view: 'WhatIsAWallet' },
    { label: 'Open "What Is a Network?" modal view', view: 'WhatIsANetwork' },
    { label: 'Open "All Wallets" modal view', view: 'AllWallets' }
  ] as const

  const modal = createAppKit({
    adapters: [], // Add your adapters here
    networks: [], // Add your networks here
    projectId: 'YOUR_PROJECT_ID'
  })

  export function YourApp() {
    return (
      <>
        {VIEWS.map(({ label, view }) => (
          <button key={view} onClick={() => modal.open({ view })}>
            {label}
          </button>
        ))}
      </>
    )
  }
  ```

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where opening the modal without adapters would open regular connect WC screen

- [#3717](https://github.com/reown-com/appkit/pull/3717) [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901) Thanks [@zoruka](https://github.com/zoruka)! - Update @walletconnect packages to latest version.

- [#3640](https://github.com/reown-com/appkit/pull/3640) [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4) Thanks [@magiziz](https://github.com/magiziz)! - Added `createAppKitWalletButton` function to `@reown/appkit-wallet-button` package for easier implementation of the Wallet Button feature without relying solely on hooks.

  **Example usage**

  ```tsx
  import { useEffect, useState } from 'react'

  import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

  const appKitWalletButton = createAppKitWalletButton()

  export function YourApp() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      // Check if Wallet Buttons are ready
      if (appKitWalletButton.isReady()) {
        setIsReady(true)
      } else {
        // Subscribe to ready state changes
        appKitWalletButton.subscribeIsReady(state => {
          setIsReady(state.isReady)
        })
      }
    }, [appKitWalletButton])

    return (
      <>
        <button onClick={() => appKitWalletButton.connect('walletConnect')} disabled={!isReady}>
          Open QR modal
        </button>
        <button onClick={() => appKitWalletButton.connect('metamask')} disabled={!isReady}>
          Connect to MetaMask
        </button>{' '}
        <button onClick={() => appKitWalletButton.connect('google')} disabled={!isReady}>
          Connect to Google
        </button>
      </>
    )
  }
  ```

- [#3681](https://github.com/reown-com/appkit/pull/3681) [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes redundant goBack call when switching to another namespace

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where appKit.getProvider() would not return correct provider.

- [#3716](https://github.com/reown-com/appkit/pull/3716) [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when API does not support it

- [#3679](https://github.com/reown-com/appkit/pull/3679) [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit client to handle syncBalance call for unsupported networks as expected

- [#3607](https://github.com/reown-com/appkit/pull/3607) [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891) Thanks [@zoruka](https://github.com/zoruka)! - Add defaultAccountTypes option for AppKit initialization.

- [#3682](https://github.com/reown-com/appkit/pull/3682) [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760) Thanks [@tomiir](https://github.com/tomiir)! - Prevents calls to Blockchain Api that would fail due to lack of support. Initialize supported list on AppKit initialization'

- [#3576](https://github.com/reown-com/appkit/pull/3576) [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d) Thanks [@magiziz](https://github.com/magiziz)! - Added a loading indicator to the account button component when the balance has not been fetched.

- [#3635](https://github.com/reown-com/appkit/pull/3635) [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connectExternal to call switch network if wallet's active chain is not in requested networks list

- [#3663](https://github.com/reown-com/appkit/pull/3663) [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9) Thanks [@zoruka](https://github.com/zoruka)! - Remove all onUri callback drilling for all walletConnectConnect methods in favor of a single call when initializing the UniversalProvider

- [#3672](https://github.com/reown-com/appkit/pull/3672) [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `walletProvider` from the `useAppKitProvider` hook was `undefined` when the wallet was connected. This issue occurred only when using wagmi adapter.

- [#3670](https://github.com/reown-com/appkit/pull/3670) [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where 1CA session would not be found because of non-cased addresses mismatching.'

- [#3715](https://github.com/reown-com/appkit/pull/3715) [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi connectors were not appearing in the connect modal

- [#3619](https://github.com/reown-com/appkit/pull/3619) [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842) Thanks [@zoruka](https://github.com/zoruka)! - Refactor to add WalletConnectConnector as extensible class and remove replicated code around adapters

- [#3678](https://github.com/reown-com/appkit/pull/3678) [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46) Thanks [@tomiir](https://github.com/tomiir)! - Removes duplicated all wallets button on AppKit Basic

- [#3680](https://github.com/reown-com/appkit/pull/3680) [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where onramp and activity were enabled in non-supported networks'

- [#3692](https://github.com/reown-com/appkit/pull/3692) [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b) Thanks [@magiziz](https://github.com/magiziz)! - Added an alert error if the analytics event fails with a forbidden status.

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Adds authProvider to embeddedWalletInfo in useAppKitAccount

- [#3714](https://github.com/reown-com/appkit/pull/3714) [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi adapter would emit disconnect event when user was not connected causing SIWE to break.

- [#3723](https://github.com/reown-com/appkit/pull/3723) [`a90474b`](https://github.com/reown-com/appkit/commit/a90474bec8d791d27dc0bec542f57193945b9e63) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where multichain social/email login was not working

- Updated dependencies [[`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde), [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a), [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991), [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3), [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3), [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901), [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4), [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43), [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b), [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891), [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760), [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d), [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6), [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9), [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1), [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b), [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce), [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842), [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46), [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc), [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc)]:
  - @reown/appkit-common@1.6.5
  - @reown/appkit-core@1.6.5

## 1.6.4

### Patch Changes

- [#3579](https://github.com/reown-com/appkit/pull/3579) [`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87) Thanks [@magiziz](https://github.com/magiziz)! - Added an error message for when the user provides an invalid project id.

- [#3562](https://github.com/reown-com/appkit/pull/3562) [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a) Thanks [@tomiir](https://github.com/tomiir)! - Sets secure site version to 3.
  Handles case where Magic SDK connection fizzled, causing magic to connected while AppKit believed it was not connected

- [#3564](https://github.com/reown-com/appkit/pull/3564) [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the balance endpoint was being called every 30 seconds for unsupported networks.

- [#3575](https://github.com/reown-com/appkit/pull/3575) [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2) Thanks [@enesozturk](https://github.com/enesozturk)! - Exposes publicKey and path for bitcoin connectors in allAccounts

- [#3596](https://github.com/reown-com/appkit/pull/3596) [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds client check for the methods in bitcoin connectors for ssr issues

- [#3560](https://github.com/reown-com/appkit/pull/3560) [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where closing the modal mid embedded wallet request would not abort the request

- [#3568](https://github.com/reown-com/appkit/pull/3568) [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where only wallets from the initially active chain ID would be fetched. Re-fetches wallets from API when network changes.

- [#3563](https://github.com/reown-com/appkit/pull/3563) [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the modal didn't close after completing login if users navigated between different social login options.

- [#3583](https://github.com/reown-com/appkit/pull/3583) [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where swap button shows an infinite spinner

- [#3573](https://github.com/reown-com/appkit/pull/3573) [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b) Thanks [@magiziz](https://github.com/magiziz)! - Added a new `required` option to SIWE/SIWX. This option determines whether the wallet stays connected when the user denies the signature request. If set to `true` it will disconnect the wallet and close the modal. If set to `false` it will close the modal without disconnecting the wallet.

  **Example usage**

  ```ts
  import { createSIWEConfig } from '@reown/appkit-siwe'
  import type { SIWECreateMessageArgs, SIWEVerifyMessageArgs } from '@reown/appkit-siwe'

  export const siweConfig = createSIWEConfig({
    required: false, // Optional - defaults to true
    getMessageParams: async () => {
      // Return message parameters
    },
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
      // Return formatted message
    },
    getNonce: async () => {
      // Return nonce
    },
    getSession: async () => {
      // Return session
    },
    verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
      // Verify message
    },
    signOut: async () => {
      // Sign out
    }
  })
  ```

- [#3586](https://github.com/reown-com/appkit/pull/3586) [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds add/remove adapter methods to appkit client, moves active connector state to connected connector

- [#3565](https://github.com/reown-com/appkit/pull/3565) [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where users with an ENS couldn't copy their address.

- [#3590](https://github.com/reown-com/appkit/pull/3590) [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi did not reconnect on page reload

- [#3584](https://github.com/reown-com/appkit/pull/3584) [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where status would not be set for non-connected namespaces. Make syncExistingConnection call syncNamespaceConnection for non-connected namespaces as well, resulting in status being set correctly'

- [#3554](https://github.com/reown-com/appkit/pull/3554) [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix farcaster issue, so user can see their correct username in account view

- [#3555](https://github.com/reown-com/appkit/pull/3555) [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - add create subscription method

- [#3558](https://github.com/reown-com/appkit/pull/3558) [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd) Thanks [@magiziz](https://github.com/magiziz)! - Added embedded wallet info to `useAppKitAccount` hook.

  **Example usage**

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  export function YourApp() {
    const { embeddedWalletInfo } = useAppKitAccount()

    const email = embeddedWalletInfo.user?.email

    return email && <p>Email address: {email}</p>
  }
  ```

- [#3592](https://github.com/reown-com/appkit/pull/3592) [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3) Thanks [@tomiir](https://github.com/tomiir)! - Fixed issue where balance would not be properly synced due to not finding correct chainId or pointing to other tokens in portfolio instead of native token

- Updated dependencies [[`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87), [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a), [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13), [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2), [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f), [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0), [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813), [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8), [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816), [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b), [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f), [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1), [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5), [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5), [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb), [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd), [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd), [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3)]:
  - @reown/appkit-common@1.6.4
  - @reown/appkit-core@1.6.4

## 1.6.3

### Patch Changes

- [`3db8487`](https://github.com/reown-com/appkit/commit/295f320b133b5bd605f9c9a89441935a2471f1ec) Thanks [@magiziz](https://github.com/magiziz)! - Updated account modal to redirect to the settings view instead of the profile view when only one social/email account is connected

- [`3db8487`](https://github.com/reown-com/appkit/commit/a3dae620d7f5209ca496ada6491eced3f0e5391c) Thanks [@magiziz](https://github.com/magiziz)! - Added a new option to enable or disable logs from email/social login.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    adapters: [
      /* Adapters */
    ],
    networks: [
      /* Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    enableAuthLogger: false // Optional - defaults to true
  })
  ```

- [`3db8487`](https://github.com/reown-com/appkit/commit/8569d56a3c6ab41833c7ef6a21712afee4bbcec0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where non-embedded wallets would show an empty list on send flow

- [`3db8487`](https://github.com/reown-com/appkit/commit/39616f5efb6f5af17ef716aca2383597cd98fdde) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes `signOutOnNetworkChange` and `signOutOnAccountChange` flags on SIWX mapper function to work as expected

- [`3db8487`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue with WC connections on wallets that do not support a requested network. Sets default network to first one supported by wallet

- [`3db8487`](https://github.com/reown-com/appkit/commit/0735f15c65b5de397dd856004f197f2ec07538f9) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would be undefined or empty

- [`3db8487`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Improves existing connection error handling'

- [`3db8487`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where disconnecting the injected wallet did not update the state as disconnected for ethers/ethers5 adapters

- [`3db8487`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed) Thanks [@tomiir](https://github.com/tomiir)! - Adds loading while disconnecting

- [`3db8487`](https://github.com/reown-com/appkit/commit/e6fc9800039984e3150c38a4c4cbd7214d07742c) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where refreshing the page when connected to multiple namespaces would only reconnect the last active one

- [`3db8487`](https://github.com/reown-com/appkit/commit/d3ecccbbde0d40a27f2b261a3d99b15ab83149da) Thanks [@tomiir](https://github.com/tomiir)! - Prevents blockchain api calls on testnets

- [`3db8487`](https://github.com/reown-com/appkit/commit/7e19daeaf93c48338f1f7b5dc5de5a271ae8f643) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Vue hooks to return reactive values

- [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - fix reload iframe after aborting farcaster

- [`3db8487`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where an incorrect EOA label and icon were displayed in the profile view after reconnecting through social/email login

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@zoruka](https://github.com/zoruka)! - Set connected wallet info when going to authenticate flow.

- [`3db8487`](https://github.com/reown-com/appkit/commit/4d25c1d7986a2b9b0128d3c250e750c60b619cc0) Thanks [@tomiir](https://github.com/tomiir)! - Updates @solana/web3.js dependency to latest

- [`3db8487`](https://github.com/reown-com/appkit/commit/7459461eed6786a17c251c40aab153572ecda45f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where profile name and profile image was not displayed after connecting via social or email login

- Updated dependencies [[`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c)]:
  - @reown/appkit-common@1.6.3
  - @reown/appkit-core@1.6.3

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
  - @reown/appkit-common@1.6.2
  - @reown/appkit-core@1.6.2

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
  - @reown/appkit-core@1.6.1
  - @reown/appkit-common@1.6.1

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
  - @reown/appkit-common@1.6.0
  - @reown/appkit-core@1.6.0

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
  import { mainnet } from '@reown/appkit/networks'
  import { createAppKit } from '@reown/appkit/react'

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
