# Controllers Reference

Controllers manage all application state using valtio proxies. They are framework-agnostic and live in `packages/controllers/`.

## Controller Pattern

Every controller follows this exact structure:

```typescript
import { proxy, subscribe as sub } from 'valtio/vanilla'
// Always vanilla
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import { withErrorBoundary } from '../utils/withErrorBoundary.js'

// -- Types ----
export interface MyControllerState {
  someValue: string
  loading: boolean
}

// -- State ----
const state = proxy<MyControllerState>({
  someValue: '',
  loading: false
})

// -- Controller ----
const controller = {
  state,

  subscribe(callback: (newState: MyControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends keyof MyControllerState>(
    key: K,
    callback: (value: MyControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  },

  setSomeValue(value: string) {
    state.someValue = value
  }
}

export const MyController = withErrorBoundary(controller)
```

### Required Section Comments

DangerJS enforces these section comments in controller files:

```
// -- Types ----
// -- State ----
// -- Controller ----
```

### Rules

- Always import from `valtio/vanilla`, never from `valtio`
- Wrap exported controller with `withErrorBoundary`
- Keep controller surface small: state object + pure methods that mutate state
- Do not import UI code into controllers
- Controllers depend only on foundations/utilities
- Every controller must have corresponding tests in `packages/controllers/tests/`

## Key Controllers

### ChainController (~875 LOC)

Multi-chain state management. Tracks active chain, active network, per-namespace account data.

```typescript
ChainController.state.activeChain // Current namespace: 'eip155' | 'solana' | ...
ChainController.state.activeCaipAddress // Current CAIP-10 address
ChainController.state.activeCaipNetwork // Current network
ChainController.state.chains // Map<ChainNamespace, ChainAdapter>
```

Key methods:

- `switchActiveNetwork(caipNetwork)` — Switch to a different network
- `switchActiveChainNamespace(namespace)` — Switch entire chain ecosystem
- `getAccountData(namespace?)` — Get account state for a namespace
- `subscribeAccountStateProp(property, callback)` — Subscribe to account state changes

### ConnectionController (~695 LOC)

Wallet connection lifecycle.

```typescript
ConnectionController.state.wcUri // WalletConnect URI for QR
ConnectionController.state.wcPairingExpiry // WC pairing timeout
ConnectionController.state.recentWallets // Recently used wallets
```

Key methods:

- `connect(args)` — Initiate wallet connection
- `disconnect()` — Disconnect current wallet
- `signMessage(message)` — Request message signature
- `sendTransaction(args)` — Send a blockchain transaction

### RouterController (~271 LOC)

Modal view navigation with history stack.

```typescript
RouterController.state.view // Current view name
RouterController.state.history // Navigation history stack
RouterController.state.data // Data passed to current view
```

Key methods:

- `push(view, data?)` — Navigate to view, push to history
- `replace(view, data?)` — Replace current view
- `reset(view, data?)` — Clear history, set view
- `goBack()` — Pop from history

### ModalController (~172 LOC)

Modal visibility and loading states.

```typescript
ModalController.state.open // Modal open/closed
ModalController.state.loading // Loading state
ModalController.state.shake // Shake animation trigger
```

Key methods:

- `open(options?)` — Open modal with optional view/namespace
- `close()` — Close modal
- `shake()` — Trigger shake animation

### ConnectorController (~506 LOC)

Manages available wallet connectors, filtering, and discovery.

### OptionsController (~470 LOC)

Feature flags and SDK configuration. Manages enableEmbedded, defaultAccountTypes, allowUnsupportedChain, etc.

### Other Controllers

| Controller                | Purpose                                           |
| ------------------------- | ------------------------------------------------- |
| `ApiController`           | Wallet/network data fetching from Reown Cloud API |
| `AccountController`       | (Legacy) Account display state                    |
| `EventsController`        | Event tracking and telemetry                      |
| `SendController`          | Token transfer transaction state                  |
| `SwapController`          | Token swap state and execution                    |
| `BlockchainApiController` | Transaction history, balance APIs                 |
| `ExchangeController`      | Fund from exchange flow                           |
| `EnsController`           | ENS domain resolution                             |
| `OnRampController`        | Fiat on-ramp provider state                       |
| `AssetController`         | Token/asset management                            |
| `PublicStateController`   | Public read-only state                            |
| `ThemeController`         | Theme mode and variables                          |
| `SnackController`         | Toast notifications                               |
| `AlertController`         | Alert dialogs                                     |
| `TelemetryController`     | Analytics and performance                         |
