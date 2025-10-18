# Polkadot Adapter for AppKit

Production-ready adapter for integrating Polkadot/Substrate chains into Reown AppKit.

## Features

✅ **Injected Wallet Support** - SubWallet, Talisman, polkadot-js extension  
✅ **Account Subscriptions** - Real-time updates when users switch accounts  
✅ **CAIP-2 Compliant** - Proper genesis hash-based chain identifiers  
✅ **Balance Caching** - Efficient balance queries with 10s TTL  
✅ **WebSocket RPC** - Resilient URL resolution for Substrate APIs  
✅ **Account Selection** - Custom UI callback for multi-account wallets  
✅ **Message Signing** - Standard `signRaw` implementation  
✅ **Event Emissions** - Full lifecycle events for AppKit integration

## Installation

```bash
pnpm add @reown/appkit-adapter-polkadot
```

## Quick Start

```typescript
import { createAppKit } from '@reown/appkit'
import { PolkadotAdapter, polkadotRelay, assetHub } from '@reown/appkit-adapter-polkadot'

// Create Polkadot adapter
const polkadotAdapter = new PolkadotAdapter({
  appName: 'My dApp',
  preferredWallets: ['subwallet-js', 'talisman', 'polkadot-js'],
  // Optional: custom account selection UI
  onSelectAccount: async (accounts) => {
    // Show your UI and return selected account
    return accounts[0]
  }
})

// Initialize AppKit with Polkadot networks
const modal = createAppKit({
  adapters: [polkadotAdapter],
  networks: [polkadotRelay, assetHub],
  projectId: 'YOUR_PROJECT_ID',
  metadata: {
    name: 'My dApp',
    description: 'My dApp description',
    url: 'https://myapp.com',
    icons: ['https://myapp.com/icon.png']
  }
})
```

## Network Definitions

The adapter exports pre-configured networks with proper CAIP-2 identifiers:

```typescript
import {
  polkadotRelay,    // Polkadot mainnet
  assetHub,         // Polkadot Asset Hub
  kusamaRelay,      // Kusama mainnet
  westendTestnet    // Westend testnet
} from '@reown/appkit-adapter-polkadot'
```

### Custom Networks

Define custom Substrate networks using the CAIP-2 format (genesis hash as chain ID):

```typescript
import type { CaipNetwork } from '@reown/appkit-common'

const myParachain: CaipNetwork = {
  id: '<first-32-hex-chars-of-genesis-hash>',
  name: 'My Parachain',
  chainNamespace: 'polkadot',
  caipNetworkId: 'polkadot:<first-32-hex-chars-of-genesis-hash>',
  nativeCurrency: {
    name: 'Token',
    symbol: 'TKN',
    decimals: 12
  },
  rpcUrls: {
    default: {
      webSocket: ['wss://rpc.mychain.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.mychain.io'
    }
  }
}
```

**Important:** The `id` and `caipNetworkId` must use the **first 32 hex characters** of the genesis hash (without `0x` prefix).

## Key Improvements (v2.0)

### 1. Account Subscriptions

Automatically detects when users switch accounts in their extension:

```typescript
// Adapter emits 'accountChanged' when extension account changes
// AppKit hooks (useAccount, etc.) update automatically
```

### 2. CAIP-2 Format

Proper chain identification using genesis hashes:

```typescript
// ✅ Correct: polkadot:91b171bb158e2d3848fa23a9f1c25182
// ❌ Wrong: polkadot:0 or polkadot:polkadot
```

### 3. WebSocket Resolution

Resilient RPC URL handling:

```typescript
// Prefers: rpcUrls.default.webSocket[0]
// Fallback: rpcUrls.public.webSocket[0]
// Fallback: wss:// URLs in http arrays
```

### 4. Balance Caching

10-second cache reduces redundant RPC calls:

```typescript
// Cache key format: "polkadot:91b171bb...25182:5GrwvaEF5zXb..."
// TTL: 10 seconds
```

### 5. Proper Account Types

Returns actual signing scheme (sr25519/ed25519) instead of generic "eoa":

```typescript
{
  address: '5GrwvaEF...',
  type: 'sr25519', // or 'ed25519'
  namespace: 'polkadot'
}
```

## API Reference

### PolkadotAdapter

```typescript
class PolkadotAdapter extends AdapterBlueprint {
  constructor(options?: PolkadotAdapterOptions)
  
  // Required by AdapterBlueprint
  syncConnectors(): void
  connect(params: ConnectParams): Promise<ConnectResult>
  disconnect(params?: DisconnectParams): Promise<DisconnectResult>
  getAccounts(params: GetAccountsParams): Promise<GetAccountsResult>
  getBalance(params: GetBalanceParams): Promise<GetBalanceResult>
  signMessage(params: SignMessageParams): Promise<SignMessageResult>
  
  // Not yet implemented
  sendTransaction(): Promise<never> // throws
}
```

### Options

```typescript
interface PolkadotAdapterOptions {
  /** App name shown in extension authorization (default: "AppKit Polkadot") */
  appName?: string
  
  /** Preferred wallet extensions in order (default: subwallet, talisman, polkadot-js) */
  preferredWallets?: PolkadotWalletSource[]
  
  /** Custom account selection UI callback */
  onSelectAccount?: (accounts: PolkadotAccount[]) => Promise<PolkadotAccount>
}
```

### Account Selection

For wallets with multiple accounts, provide a custom selection UI:

```typescript
const adapter = new PolkadotAdapter({
  onSelectAccount: async (accounts) => {
    return new Promise((resolve, reject) => {
      showAccountModal({
        accounts,
        onSelect: resolve,
        onCancel: () => reject(new Error('Selection cancelled'))
      })
    })
  }
})
```

If not provided, the first account is auto-selected.

## Events

The adapter emits standard AppKit events:

- `connectors` - When wallets are detected
- `accountChanged` - When user switches accounts
- `connections` - When connection state changes
- `disconnect` - When all connections are closed

## Browser Extension Detection

The adapter detects wallets via `window.injectedWeb3` **without** triggering authorization prompts. Authorization only occurs on `connect()`.

### Supported Wallets

| Extension | ID | Source |
|-----------|----|----|
| SubWallet | `subwallet` | `subwallet-js` |
| Talisman | `talisman` | `talisman` |
| Polkadot{.js} | `polkadot` | `polkadot-js` |

## Message Signing

Uses extension's `signRaw` method:

```typescript
const signature = await adapter.signMessage({
  address: '5GrwvaEF...',
  message: 'Sign this message'
})
// signature.signature: "0x..."
```

## Limitations

- **No sendTransaction yet** - Transaction building/submission coming soon
- **Extension-only** - No WalletConnect support in this version
- **No network switching** - Users switch networks in extension UI

## Troubleshooting

### "No Polkadot extension found"

Install one of:
- [SubWallet](https://subwallet.app/)
- [Talisman](https://talisman.xyz/)
- [Polkadot{.js}](https://polkadot.js.org/extension/)

### "No WebSocket RPC URL configured"

Ensure your network has `rpcUrls.default.webSocket`:

```typescript
rpcUrls: {
  default: {
    webSocket: ['wss://rpc.polkadot.io']
  }
}
```

### Account not updating after extension switch

The adapter subscribes to `web3AccountsSubscribe` automatically. If updates aren't working, check browser console for subscription errors.

### Balance shows as "0" incorrectly

Check:
1. Network RPC URL is accessible
2. Address is formatted correctly (SS58)
3. Account exists on chain (not below existential deposit)

## Development

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Type Check

```bash
pnpm typecheck
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the monorepo root.

## License

Apache 2.0

