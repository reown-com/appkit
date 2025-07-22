---
'@reown/appkit-wallet-button': patch
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
---

Upgraded wallet button to support multichain via the `namespace` prop

**Example usage with Components**

```tsx
import { AppKitWalletButton } from '@reown/appkit-wallet-button/react'

const wallets = [
  { wallet: 'metamask', namespace: 'eip155', label: 'MetaMask EVM' },
  { wallet: 'metamask', namespace: 'solana', label: 'MetaMask Solana' },
  { wallet: 'phantom', namespace: 'bip122', label: 'Phantom Bitcoin' },
]

export function WalletButtons() {
  return (
    <>
      {wallets.map(({ wallet, namespace, label }) => (
        <AppKitWalletButton
          key={`${wallet}-${namespace}`}
          wallet={wallet}
          namespace={namespace}
        />
      ))}
    </>
  )
}
```

**Example usage with Hooks**
```tsx
import { useAppKitWallet } from '@reown/appkit-wallet-button/react'

export function YourApp() {
  const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
    namespace: 'eip155', // Use 'solana' or 'bip122' for other chains
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

**Example usage with Vanilla JS**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">
      import '@reown/appkit-wallet-button'
      import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

      const wallet = createAppKitWalletButton({ namespace: 'eip155' })

      wallet.subscribeIsReady(({ isReady }) => {
        if (!isReady) return

        document.querySelectorAll('button[data-wallet]').forEach(button => {
          button.disabled = false
          button.onclick = () => {
            const id = button.getAttribute('data-wallet')
            wallet.connect(id)
          }
        })
      })
    </script>
  </head>
  <body>
    <appkit-wallet-button wallet="metamask" namespace="eip155"></appkit-wallet-button>

    <button data-wallet="walletConnect" disabled>Open QR modal</button>
    <button data-wallet="metamask" disabled>Connect to MetaMask</button>
    <button data-wallet="google" disabled>Connect to Google</button>
  </body>
</html>
```