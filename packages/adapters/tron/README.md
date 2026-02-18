# AppKit TRON Adapter

The TRON adapter enables TRON blockchain support in AppKit, allowing users to connect with various TRON wallets.

## Installation

```bash
npm install @reown/appkit @reown/appkit-adapter-tron
```

## Wallet Adapters

The TRON adapter requires you to install and provide the wallet adapters you want to support. This gives you control over bundle size and which wallets to include.

### Available Wallet Adapters

```bash
# Install the wallet adapters you want to support
npm install @tronweb3/tronwallet-adapter-tronlink
npm install @tronweb3/tronwallet-adapter-metamask-tron
npm install @tronweb3/tronwallet-adapter-trust
npm install @tronweb3/tronwallet-adapter-okxwallet
npm install @tronweb3/tronwallet-adapter-bitkeep
npm install @tronweb3/tronwallet-adapter-binance
```

## Usage

### Basic Setup

```typescript
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
// Import only the wallet adapters you want to support
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import { TronAdapter } from '@reown/appkit-adapter-tron'
import { tronMainnet, tronShastaTestnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

// Create TRON adapter with wallet adapters
const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({
      openUrlWhenWalletNotFound: false,
      checkTimeout: 3000
    }),
    new MetaMaskAdapter(),
    new TrustAdapter()
  ]
})

// Create AppKit instance
createAppKit({
  adapters: [tronAdapter],
  networks: [tronMainnet, tronShastaTestnet],
  projectId: 'YOUR_PROJECT_ID',
  metadata: {
    name: 'My App',
    description: 'My App Description',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png']
  }
})
```

### All Wallet Adapters

```typescript
import { BinanceWalletAdapter } from '@tronweb3/tronwallet-adapter-binance'
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep'
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask-tron'
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'
import { TrustAdapter } from '@tronweb3/tronwallet-adapter-trust'

import { TronAdapter } from '@reown/appkit-adapter-tron'

const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({ openUrlWhenWalletNotFound: false, checkTimeout: 3000 }),
    new MetaMaskAdapter(),
    new TrustAdapter(),
    new OkxWalletAdapter({ openUrlWhenWalletNotFound: false }),
    new BitKeepAdapter(),
    new BinanceWalletAdapter()
  ]
})
```

### Minimal Setup (TronLink only)

```typescript
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink'

import { TronAdapter } from '@reown/appkit-adapter-tron'

const tronAdapter = new TronAdapter({
  walletAdapters: [
    new TronLinkAdapter({
      openUrlWhenWalletNotFound: false,
      checkTimeout: 3000
    })
  ]
})
```

## API Reference

### TronAdapter

```typescript
interface TronAdapterParams {
  /**
   * Array of TRON wallet adapters to support.
   * Install desired wallet adapter packages and pass them here.
   */
  walletAdapters?: Adapter[]
}

const adapter = new TronAdapter(params?: TronAdapterParams)
```

### Parameters

- **walletAdapters** (optional): Array of TRON wallet adapter instances. If not provided, no wallets will be available.

## Supported Networks

- TRON Mainnet (Nile)
- TRON Shasta Testnet

```typescript
import { tronMainnet, tronShastaTestnet } from '@reown/appkit/networks'
```

## Wallet Adapter Configuration

Each wallet adapter accepts its own configuration options. Refer to the official [@tronweb3 adapter documentation](https://github.com/tronprotocol/tronwallet-adapter) for detailed configuration options.

### Common Options

```typescript
// TronLinkAdapter
new TronLinkAdapter({
  openUrlWhenWalletNotFound: false, // Don't redirect to install page
  checkTimeout: 3000 // Wallet detection timeout (ms)
})

// OkxWalletAdapter
new OkxWalletAdapter({
  openUrlWhenWalletNotFound: false
})

// Other adapters use default configuration
new MetaMaskAdapter()
new TrustAdapter()
new BitKeepAdapter()
new BinanceWalletAdapter()
```

## TypeScript

The adapter includes full TypeScript support with exported types:

```typescript
import { TronAdapter, TronAdapterParams, TronWalletAdapter } from '@reown/appkit-adapter-tron'
```

## Examples

See the [next-tron-app-router example](../../../examples/next-tron-app-router) for a complete working implementation.

## License

Apache-2.0
