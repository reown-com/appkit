---
'@reown/appkit': patch
'@reown/appkit-core': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Expanded more views in the modal open function to include Swap, Send, Wallet Is a Wallet, Wallet Is a Network and All Wallets screens.

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