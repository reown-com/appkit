# Blockchain Adapters Guide

Adapters bridge between the AppKit SDK and specific blockchain ecosystems. They live in `packages/adapters/`.

## AdapterBlueprint (Abstract Base)

Location: `packages/controllers/src/controllers/AdapterController/ChainAdapterBlueprint.ts`

Every adapter extends this abstract class:

```typescript
abstract class AdapterBlueprint<Connector extends ChainAdapterConnector> {
  public namespace: ChainNamespace | undefined
  public adapterType: string | undefined
  protected availableConnectors: Connector[] = []
  protected availableConnections: Connection[] = []

  // Must implement:
  abstract construct(params: AdapterBlueprint.Params): void
  abstract setUniversalProvider(provider: UniversalProvider): Promise<void>

  // Core connection methods:
  async connect(params): Promise<string>
  async disconnect(): Promise<void>
  async switchNetwork(caipNetwork): Promise<boolean>
  async signMessage(message): Promise<string>
  async sendTransaction(args): Promise<string>
  async estimateGas(args): Promise<bigint>
  async getBalance(): Promise<GetBalanceResult>

  // Event system:
  addEventListener(event: EventName, callback): void
  removeEventListener(event: EventName, callback): void

  // Provider management:
  setAuthProvider(authProvider: W3mFrameProvider): void
  setUniversalProvider(universalProvider: UniversalProvider): Promise<void>
}
```

### Event Types

Adapters emit these events:

- `disconnect` — Wallet disconnected
- `accountChanged` — Active account changed
- `switchNetwork` — Network switched
- `connections` — Available connections changed
- `connectors` — Available connectors changed
- `pendingTransactions` — Pending transaction state changed

## Available Adapters

### Wagmi (`@reown/appkit-adapter-wagmi`)
EVM chains via Wagmi/Viem.

```typescript
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, arbitrum],
  projectId: 'your-project-id',
  customRpcUrls: { 1: 'https://...' },  // Optional
})

// Exposes wagmiConfig for direct Wagmi usage
wagmiAdapter.wagmiConfig
```

### Solana (`@reown/appkit-adapter-solana`)
Solana blockchain.

```typescript
import { SolanaAdapter } from '@reown/appkit-adapter-solana'

const solanaAdapter = new SolanaAdapter({
  connectionSettings: 'confirmed',  // Commitment level
  wallets: [...],                    // Optional wallet list
})
```

### Bitcoin (`@reown/appkit-adapter-bitcoin`)
Bitcoin and UTXO-based chains.

### Ethers v6 (`@reown/appkit-adapter-ethers`)
EVM via ethers.js v6.

### Ethers v5 (`@reown/appkit-adapter-ethers5`)
EVM via ethers.js v5 (legacy support).

### Polkadot (`@reown/appkit-adapter-polkadot`)
Polkadot ecosystem (private/internal).

### TON (`@reown/appkit-adapter-ton`)
TON blockchain.

## Creating a New Adapter

1. Create `packages/adapters/<name>/` mirroring existing adapter structure:
   ```
   packages/adapters/<name>/
   ├── src/
   │   ├── client.ts       # Adapter class extending AdapterBlueprint
   │   ├── index.ts         # Package exports
   │   ├── connectors/      # Connector implementations
   │   ├── providers/       # Provider implementations
   │   └── utils/           # Helper utilities
   ├── tests/
   ├── package.json
   ├── tsconfig.json
   └── vitest.config.ts
   ```

2. Extend `AdapterBlueprint`:
   ```typescript
   export class MyAdapter extends AdapterBlueprint<MyConnector> {
     constructor(params: MyAdapterParams) {
       super({ namespace: 'mychain' })
     }

     override async connect(params) { /* ... */ }
     override async disconnect() { /* ... */ }
     override async switchNetwork(network) { /* ... */ }
     override async signMessage(message) { /* ... */ }
     override async sendTransaction(args) { /* ... */ }
     override async getBalance() { /* ... */ }
   }
   ```

3. Dependencies in `package.json`:
   - `@reown/appkit` — SDK facade
   - `@reown/appkit-common` — Types/utils
   - `@reown/appkit-utils` — Integration helpers
   - `@reown/appkit-wallet` — Wallet models
   - Ecosystem SDKs as `peerDependencies`
   - Optional wallets as `optionalDependencies`

4. Keep business logic in controllers/utilities; adapters translate between host SDK APIs and AppKit abstractions.

5. Add to `pnpm-workspace.yaml` and test with an example app.
