---
'@reown/appkit-wallet-button': patch
'@reown/appkit-experimental': patch
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-ui': patch
---

Implements new `useAppKitWallets` hook to let users build custom connect user interfaces.


### Features

- List, and connect with extension wallets.
- List, search and connect the WalletConnect wallets.
- Multi-chain.
- Multi-platform.

### Examples

**Listing injected wallets:**

```tsx
const { data } = useAppKitWallets()

const injectedWallets = data.filter(wallet => wallet.isInjected)

injectedWallets.map(wallet =>{
    return <WalletItem name={wallet.name} imageSrc={wallet.imageUrl} />
})
```

**Listing WalletConnect wallets:**

```tsx
const { data } = useAppKitWallets()

const wcWallets = data.filter(wallet => !wallet.isInjected)

wcWallets.map(wallet =>{
    return <WalletItem name={wallet.name} imageSrc={wallet.imageUrl} />
})
```

**Connecting to a wallet:**

```tsx
const { connect } = useAppKitWallets()
...
await connect(wallet)
```