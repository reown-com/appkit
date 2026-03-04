# AGENTS.md

Reown AppKit — a multi-chain onchain SDK providing wallet connection, authentication, swaps, on-ramp, and transaction UX for 700+ wallets across EVM, Solana, Bitcoin, Polkadot, and TON. Available for React, Next.js, Vue, Nuxt, Svelte, vanilla JS, React Native, Flutter, and native mobile.

## Quick Reference

- **Package manager**: pnpm workspaces (`pnpm-workspace.yaml`)
- **Build orchestration**: Turborepo (`turbo.json`)
- **State management**: valtio (always import from `valtio/vanilla`)
- **UI framework**: LitElement Web Components
- **Testing**: Vitest (unit), Playwright (E2E in `apps/laboratory`)
- **TypeScript**: Strict mode, ESM only, `experimentalDecorators` enabled

## Commands

```bash
pnpm install              # Install dependencies
pnpm build                # Build all packages (run before apps or tests)
pnpm test                 # Unit tests (Vitest)
pnpm typecheck            # Type checking (depends on build)
pnpm lint                 # ESLint
pnpm run prettier:format  # Format code (run before committing)
pnpm changeset            # Create a changeset for versioning
pnpm laboratory           # Run E2E testing app
pnpm demo:dev             # Run demo app
pnpm gallery              # Run Storybook component gallery
```

## Repository Layout

```
packages/
  appkit/              → @reown/appkit             Main SDK facade
  controllers/         → @reown/appkit-controllers  Valtio state management
  ui/                  → @reown/appkit-ui           Atomic wui-* Web Components
  scaffold-ui/         → @reown/appkit-scaffold-ui  High-level w3m-* UI flows
  common/              → @reown/appkit-common       Shared types and utilities
  appkit-utils/        → @reown/appkit-utils        Chain-specific helpers
  wallet/              → @reown/appkit-wallet       Wallet models
  pay/                 → @reown/appkit-pay          Payment flows
  siwe/                → @reown/appkit-siwe         Sign-In With Ethereum
  siwx/                → @reown/appkit-siwx         Cross-chain authentication
  adapters/
    wagmi/             → EVM via Wagmi/Viem
    ethers/            → EVM via ethers v6
    ethers5/           → EVM via ethers v5
    solana/            → Solana
    bitcoin/           → Bitcoin
    polkadot/          → Polkadot
    ton/               → TON
apps/
  laboratory/          → E2E testing (Next.js + Playwright)
  demo/                → Marketing demo
  gallery/             → Storybook component gallery
examples/              → Integration examples (next-*, react-*, vue-*, svelte-*, html-*)
```

## Architecture Rules

### Layer Order (dependencies flow downward only)

```
apps & examples
  ↓
adapters (wagmi, solana, bitcoin, ethers, ...)
  ↓
@reown/appkit (SDK facade)
  ↓
scaffold-ui (w3m-*) · pay
  ↓
ui (wui-*) · controllers · appkit-utils
  ↓
common · wallet · polyfills
```

### Import Boundaries

- **ui** (`wui-*`): Cannot import from controllers, scaffold-ui, appkit, or adapters
- **controllers**: Cannot import from ui, scaffold-ui, appkit, or adapters
- **scaffold-ui** (`w3m-*`): Uses relative imports within the package, not `@reown/` paths
- **adapters**: Import from `@reown/appkit` and foundations, never from controllers or ui directly
- **Cross-package**: Always use package entrypoints or declared subpath exports, never deep internal paths

### Chain Namespaces

| Namespace  | Chain    | Adapter                |
| ---------- | -------- | ---------------------- |
| `eip155`   | EVM      | wagmi, ethers, ethers5 |
| `solana`   | Solana   | solana                 |
| `bip122`   | Bitcoin  | bitcoin                |
| `polkadot` | Polkadot | polkadot               |
| `ton`      | TON      | ton                    |

## Where to Put Things

| What you're building     | Where it goes                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| New state/business logic | `packages/controllers/src/controllers/` — follow [controller pattern](.agents/context/controllers.md)   |
| New atomic UI element    | `packages/ui/src/composites/wui-<name>/` — follow [UI guide](.agents/context/ui-components.md)          |
| New modal view/screen    | `packages/scaffold-ui/src/views/w3m-<name>-view/` — register in RouterController + w3m-router           |
| Reusable UI section      | `packages/scaffold-ui/src/partials/w3m-<name>/`                                                         |
| New blockchain adapter   | `packages/adapters/<name>/` — extend AdapterBlueprint, see [adapter guide](.agents/context/adapters.md) |
| Shared types or utils    | `packages/common/src/`                                                                                  |
| Chain-specific helpers   | `packages/appkit-utils/src/`                                                                            |
| Public SDK API           | `packages/appkit/exports/` — treat changes as potentially breaking                                      |
| Unit tests               | Co-located `tests/` directory in the relevant package                                                   |
| E2E tests                | `apps/laboratory/tests/` using Page Object Model                                                        |
| Integration example      | `examples/<framework>-<adapter>/`                                                                       |

## Code Patterns

### Controllers (valtio state)

```typescript
// packages/controllers/src/controllers/MyController.ts
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

// -- Types ----
export interface MyControllerState {
  value: string
}

// -- State ----
const state = proxy<MyControllerState>({ value: '' })

// -- Controller ----
const controller = {
  state,
  subscribe(callback: (s: MyControllerState) => void) {
    return sub(state, () => callback(state))
  },
  subscribeKey<K extends keyof MyControllerState>(key: K, cb: (v: MyControllerState[K]) => void) {
    return subKey(state, key, cb)
  },
  setValue(v: string) {
    state.value = v
  }
}
export const MyController = withErrorBoundary(controller)
```

Section comments (`// -- Types ----`, `// -- State ----`, `// -- Controller ----`) are enforced by DangerJS.

### UI Atoms (wui-\*)

```typescript
// packages/ui/src/composites/wui-my-thing/index.ts
@customElement('wui-my-thing')
export class WuiMyThing extends LitElement {
  public static override styles = [resetStyles, styles] // resetStyles required
  // -- State & Properties ----
  @property() public variant = 'default' // @state() NOT allowed
  // -- Render ----
  public override render() {
    return html`<slot></slot>`
  }
}
```

### Scaffold Views (w3m-\*)

```typescript
// packages/scaffold-ui/src/views/w3m-my-view/index.ts
@customElement('w3m-my-view')
export class W3mMyView extends LitElement {
  private unsubscribe: (() => void)[] = [] // Cleanup required
  @state() private value = SomeController.state.value

  constructor() {
    super()
    this.unsubscribe.push(
      SomeController.subscribeKey('value', v => {
        this.value = v
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(u => u())
  }
}
```

### Adapters

Extend `AdapterBlueprint` from `packages/controllers/src/controllers/AdapterController/ChainAdapterBlueprint.ts`. Implement: `connect()`, `disconnect()`, `switchNetwork()`, `signMessage()`, `sendTransaction()`, `getBalance()`. Host SDKs go in `peerDependencies`.

## PR Requirements

1. Run `pnpm build && pnpm run prettier:format` before submitting
2. Use conventional commit format for PR titles (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`)
3. Bug fixes and new features require tests
4. Create a changeset: `pnpm changeset`
5. DangerJS validates import boundaries, naming conventions, section comments, and dependency rules

## Versioning

All `@reown/appkit-*` packages are versioned together as a fixed group via Changesets. Release channels: `latest`, `alpha`, `beta`, `canary`. `@examples/*` and `@apps/*` are excluded from publishing.

## Detailed Context

For in-depth guidance on specific topics:

- [Architecture & Initialization Flow](.agents/context/architecture.md) — layer diagram, import boundaries, init sequence, network request policy
- [Controllers Reference](.agents/context/controllers.md) — valtio patterns, all controllers, state shapes
- [UI Components Guide](.agents/context/ui-components.md) — wui-_ and w3m-_ patterns, DangerJS rules, adding views
- [Blockchain Adapters Guide](.agents/context/adapters.md) — AdapterBlueprint, creating new adapters
- [Testing Guide](.agents/context/testing.md) — Vitest, Playwright, test locations, writing new tests
- [Package Reference](.agents/context/packages.md) — all packages, build outputs, adding packages
- [Contributing & PR Guide](.agents/context/contributing.md) — PR checks, changesets, release process
