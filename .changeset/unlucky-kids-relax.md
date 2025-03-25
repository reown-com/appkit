---
'@reown/appkit-wallet-button': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-core': patch
'@reown/appkit-ui': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-wallet': patch
---

- Added email wallet button
- Added email update functionality

**TypeScript Example usage**

```ts
import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

const appKitWalletButton = createAppKitWalletButton()

const connectEmail = async () => {
  const { address, chainId, chainNamespace } = await appKitWalletButton.connect('email')

  return { address, chainId, chainNamespace }
}

const updateEmail = async () => {
  const { email } = await appKitWalletButton.updateEmail()

  return email // Return the new updated email
}
```

**React Hook Example usage**

```tsx
import { useAppKitUpdateEmail, useAppKitWallet } from '@reown/appkit-wallet-button/react'

export function ConnectEmail() {
  const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
    onError: err => {
      // ...
    },
    onSuccess: data => {
      // ...
    }
  })

  return <button onClick={() => connect('email')}>Connect Email</button>
}

export function UpdateEmail() {
  const { data, error, isPending, isSuccess, isError, updateEmail } = useAppKitUpdateEmail({
    onError: err => {
      // ...
    },
    onSuccess: data => {
      // ...
    }
  })

  return <button onClick={() => updateEmail()}>Update Email</button>
}
```

