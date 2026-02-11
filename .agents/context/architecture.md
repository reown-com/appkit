# Architecture Deep Dive

## Layered Dependency Graph

Dependencies flow strictly downward. Never import upward across layers.

```
┌─────────────────────────────────────────────────┐
│  apps/ & examples/        (consumers)           │
├─────────────────────────────────────────────────┤
│  adapters/wagmi, solana, bitcoin, ethers, etc.  │
│  @reown/appkit             (SDK facade)         │
│  scaffold-ui               (w3m-* flows)        │
│  pay                       (payment UI+state)   │
│  ui                        (wui-* atoms)        │
│  controllers               (valtio state)       │
│  appkit-utils              (chain helpers)       │
│  common                    (types, math, utils)  │
│  wallet                    (wallet models)       │
│  polyfills                 (browser shims)       │
└─────────────────────────────────────────────────┘
```

## Import Boundaries (Enforced by DangerJS)

| Package                         | CAN import from                                     | CANNOT import from                         |
| ------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| `common`, `wallet`, `polyfills` | standard library only                               | anything above                             |
| `controllers`                   | common, wallet, polyfills                           | ui, scaffold-ui, appkit, adapters          |
| `ui` (wui-\*)                   | common only                                         | controllers, scaffold-ui, appkit, adapters |
| `scaffold-ui` (w3m-\*)          | ui, controllers, common, appkit-utils               | appkit, adapters                           |
| `appkit` (facade)               | controllers, ui, scaffold-ui, common, utils, wallet | adapters                                   |
| adapters (wagmi, etc.)          | appkit, common, utils, wallet                       | controllers directly, ui directly          |
| apps/examples                   | any published package via entrypoints               | deep internal paths                        |

### Import Style Rules

- **Within a package**: Use relative imports with `.js` extension (`./utils/helper.js`)
- **Cross-package**: Use package name (`@reown/appkit-controllers`)
- **Subpath exports**: Use when available (`@reown/appkit/react`, `@reown/appkit-controllers/react`)
- **Never**: Deep internal paths (`@reown/appkit-controllers/dist/...`)

## Initialization Flow

```
createAppKit(options)
  → new AppKit(options + sdkVersion)
    → AppKitBaseClient constructor
      → Register chain adapters (ChainController.addChain)
      → Initialize controllers
      → Setup universal provider (WalletConnect)
      → Configure features (local + remote)
    → ModalController.open()
      → Prefetch API data
      → Router.reset(initialView)
    → W3mModal renders
      → Mount Web Components
      → Subscribe to controller state
```

## Chain Namespaces

Each blockchain ecosystem has a unique namespace identifier:

| Namespace  | Chain                         | Adapter Package                                     |
| ---------- | ----------------------------- | --------------------------------------------------- |
| `eip155`   | EVM (Ethereum, Polygon, etc.) | `@reown/appkit-adapter-wagmi` or `ethers`/`ethers5` |
| `solana`   | Solana                        | `@reown/appkit-adapter-solana`                      |
| `bip122`   | Bitcoin                       | `@reown/appkit-adapter-bitcoin`                     |
| `polkadot` | Polkadot                      | `@reown/appkit-adapter-polkadot`                    |
| `ton`      | TON                           | `@reown/appkit-adapter-ton`                         |

Namespaces are used as keys in `ChainController.chains` Map and to route operations to the correct adapter.

## Connector Types

```typescript
type ConnectorType =
  | 'EXTERNAL' // Injected wallets (MetaMask, Phantom)
  | 'WALLET_CONNECT' // WalletConnect protocol
  | 'INJECTED' // Browser extension injected
  | 'ANNOUNCED' // EIP-6963 announced wallets
  | 'AUTH' // Email/social authentication
  | 'MULTI_CHAIN' // Multi-chain capable connectors
```

## SDK Configuration (AppKitOptions)

```typescript
createAppKit({
  networks: [mainnet, polygon, solana],     // Required: supported networks
  adapters: [wagmiAdapter, solanaAdapter],   // Optional: blockchain adapters
  projectId: 'your-project-id',             // Required: Reown Cloud project ID
  metadata: { name, description, url, icons },
  features: {
    email: true,           // Email login
    socials: ['google'],   // Social login providers
    swaps: true,           // Token swaps
    onramp: true,          // Fiat on-ramp
    pay: true,             // Payments
  },
  themeMode: 'dark',                        // 'dark' | 'light' | 'system'
  themeVariables: { ... },                  // CSS custom property overrides
})
```

## Network Request Policy

- No startup I/O: SDK must not issue network requests during module import, init, or initial page load
- Single intent-bound fetch: On first user action, perform one consolidated request
- No redundant/parallel calls: Disallow duplicate requests for the same resource
- Scope discipline: Only fetch what is needed for the current UI state
- Graceful UI: Render skeleton/placeholders while data loads
