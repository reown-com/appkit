---
'@reown/appkit-wallet-button': patch
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Added `createAppKitWalletButton` function to `@reown/appkit-wallet-button` package for easier implementation of the Wallet Button feature without relying solely on hooks.

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