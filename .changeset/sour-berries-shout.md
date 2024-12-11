---
'@reown/appkit-adapter-solana': patch
'@reown/appkit-wallet-button': patch
'@reown/appkit-utils': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@apps/builder': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-wallet': patch
---

Introduced wallet button component and custom hook for headless integration.

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
