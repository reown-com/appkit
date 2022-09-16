> Looking for v1.x readme? It is available on [V1 Branch](https://github.com/WalletConnect/web3modal/tree/V1)

# Web3Modal-v2

Your on-ramp to web3 multichain.

## Introduction

Web3Modal is an easy-to-use library to help developers add support for multiple providers in their apps with a simple customizable configuration. This library leverages WalletConnect V2 client ([repo](https://github.com/WalletConnect/walletconnect-monorepo/), [docs](https://docs.walletconnect.com/2.0/introduction/sign/)) and [Wagmi](https://wagmi.sh/).

By default Web3Modal library supports providers like:

- **Metamask**
- **Injected**
- **WalletConnect**
- **Coinbase Wallet**
- and many more to be added

## Quick Start

During the alpha release cycle, we focused on providing the best experience for connecting your react dapps with Ethereum (evm) compatible chains.   Expect support for more frameworks like Vue and chains like Solana to follow soon.

### 1. Install web3modal and wagmi packages

```
npm install @web3modal/react @web3modal/ethereum @wagmi/core
```

### 2. Configure wagmi and web3modal clients at the root of your app (you can also reference our [react example app](https://github.com/WalletConnect/web3modal/tree/V2/examples/react))

```tsx
import { chain, configureChains, createClient } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { Web3ModalEthereum } from '@web3modal/ethereum'
import type { ConfigOptions } from '@web3modal/react'
import { Web3ModalProvider } from '@web3modal/react'

// Get Your projectId at https://cloud.walletconnect.com
const WC_PROJECT_ID = 'YOUR_PROJECT_ID'

// Configure chains and providers (rpc's)
const { chains, provider } = configureChains([chain.mainnet], [publicProvider()])

// Create wagmi client
const wagmiClient = createClient({
  autoConnect: true,
  connectors: Web3ModalEthereum.defaultConnectors({ chains, appName: 'web3Modal' }),
  provider
})

// Configure web3modal
const modalConfig: ConfigOptions = {
  projectId: WC_PROJECT_ID,
  theme: 'dark',
  accentColor: 'orange'
}

export default function App() {
  return (
    <Web3ModalProvider config={modalConfig} ethereumClient={wagmiClient}>
      {/* Rest of your app */}
    </Web3ModalProvider>
  )
}
```

### 3. Import ConnectButton component or use `useConnectModal` hook to open the modal

```ts
import { ConnectButton, useConnectModal } from '@web3modal/react'
```

### 4. Use selection of web3modal / wagmi hooks to opperate your dapp

Please see our [react hooks folder](https://github.com/WalletConnect/web3modal/tree/V2/packages/react/src/hooks) for available options while we are working on fully documenting web3modal.

### 5. Customise your modal

As of now, we support the following config options to help you customise the look and feel of your modal. We will add more options soon.

- theme - `'dark' | 'light'`
- accentColor - `'blackWhite' | 'blue' | 'default' | 'green' | 'magenta' | 'orange' | 'purple' | 'teal'`
