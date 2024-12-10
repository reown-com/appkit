# @apps/builder

## 1.1.8

### Patch Changes

- [#3371](https://github.com/reown-com/appkit/pull/3371) [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds separate event for swap approval process

- [#3401](https://github.com/reown-com/appkit/pull/3401) [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d) Thanks [@zoruka](https://github.com/zoruka)! - Add BitcoinAdapter.getBalance implementation based on BitcoinApi

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

- Updated dependencies [[`26e9f12`](https://github.com/reown-com/appkit/commit/26e9f12aef1d5e32f7814be189de5d405903b378), [`548962c`](https://github.com/reown-com/appkit/commit/548962c710dd973da2128c415bb2beaea044751f), [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`69f9469`](https://github.com/reown-com/appkit/commit/69f94693357bcf2dbffc8aa4c81aa0c0a592fc1f), [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c), [`0c55e65`](https://github.com/reown-com/appkit/commit/0c55e6576da71a7aa5922a02ff489184bf65c026), [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5), [`1021422`](https://github.com/reown-com/appkit/commit/1021422c157b3a8a4d90edcd40f435adac21d119), [`7236c86`](https://github.com/reown-com/appkit/commit/7236c866986a9bf218963542e445de27b86ab7f0), [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b), [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e), [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d), [`ca659e7`](https://github.com/reown-com/appkit/commit/ca659e71e38cfa137b73b12a42e99cbcf99ff02a), [`4c9410a`](https://github.com/reown-com/appkit/commit/4c9410a76a932b83115f7eec043ff88aab38f7e0), [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389), [`8f1ce50`](https://github.com/reown-com/appkit/commit/8f1ce503548c1218d5d13f174341a0742aa2d22e), [`d4352b0`](https://github.com/reown-com/appkit/commit/d4352b01aa71f6fce8f67ec50225f51250b0bfc8), [`d07a72b`](https://github.com/reown-com/appkit/commit/d07a72bb6397bb4580b9999bdbe927817d5b015e), [`50c619a`](https://github.com/reown-com/appkit/commit/50c619aacfbcf34952d78465a597bcbf59d9bdf8), [`9e1e4c9`](https://github.com/reown-com/appkit/commit/9e1e4c9ac565c2164750f178b6d896e57d3b68e5), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`48b9054`](https://github.com/reown-com/appkit/commit/48b90547f06c40a9030c0ea6d869d94237a1053d), [`76acc12`](https://github.com/reown-com/appkit/commit/76acc1288879884443d71e798f33b81aee1e2945), [`b7b8e3d`](https://github.com/reown-com/appkit/commit/b7b8e3db393aaa2b42454b7abcd074e2a7f4ab43), [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d), [`1e05f00`](https://github.com/reown-com/appkit/commit/1e05f004b8778c1ce1693681824676fda5b5aa5f)]:
  - @reown/appkit-scaffold-ui@1.5.4
  - @reown/appkit-adapter-wagmi@1.5.4
  - @reown/appkit@1.5.4
  - @reown/appkit-core@1.5.4
