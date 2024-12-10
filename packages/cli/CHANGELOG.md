# @reown/appkit-cli

## 1.5.4

### Patch Changes

- [#3404](https://github.com/reown-com/appkit/pull/3404) [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where setEIP6963Enabled is not getting called

- [#3371](https://github.com/reown-com/appkit/pull/3371) [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds separate event for swap approval process

- [#3419](https://github.com/reown-com/appkit/pull/3419) [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes state and storage syncronization and persisting on multiple adapter instances

- [#3408](https://github.com/reown-com/appkit/pull/3408) [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b) Thanks [@zoruka](https://github.com/zoruka)! - Add Bitcoin OKX Wallet connector

- [#3417](https://github.com/reown-com/appkit/pull/3417) [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Solana Connection was not being set on WC Relay wallets, causing transactions to fail.

- [#3401](https://github.com/reown-com/appkit/pull/3401) [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d) Thanks [@zoruka](https://github.com/zoruka)! - Add BitcoinAdapter.getBalance implementation based on BitcoinApi

- [#3400](https://github.com/reown-com/appkit/pull/3400) [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors some ui rendering logics and enables setting extra configurations via modal functions

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

- [#3412](https://github.com/reown-com/appkit/pull/3412) [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes embedded mode route redirection issue and adds transition for border radius values
