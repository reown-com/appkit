# AGENTS.md

This file provides guidance for AI agents working with the Reown AppKit repository.

## Project Overview

Reown AppKit is a full-stack toolkit for building blockchain application user experiences. It provides developers with a comprehensive SDK that abstracts the complexity of Web3 wallet integration, multi-chain support, and user authentication across Ethereum (EVM), Solana, Bitcoin, Polkadot, and TON networks.

AppKit enables connection to 300+ wallets including MetaMask, WalletConnect, Phantom, Leather, and embedded email/social wallets. It provides a single API for multiple blockchain ecosystems with automatic network switching, built-in support for token swaps, on-ramp (fiat-to-crypto), transaction sending, and pre-built customizable modal UI with dark/light themes.

The SDK is available for React, Next.js, Vue, Nuxt, Svelte, vanilla JavaScript, React Native, Flutter, Android, iOS, and Unity.

## Repository Structure

This is a pnpm workspace monorepo managed by Turborepo, organized into four main categories:

```
@reown/appkit-monorepo/
├── packages/           # Core SDK packages (publishable to npm)
│   ├── appkit/         # Main SDK entry point (@reown/appkit)
│   ├── adapters/       # Blockchain-specific adapters
│   │   ├── wagmi/      # EVM via Wagmi/viem
│   │   ├── ethers/     # EVM via ethers v6
│   │   ├── ethers5/    # EVM via ethers v5
│   │   ├── solana/     # Solana support
│   │   ├── bitcoin/    # Bitcoin support
│   │   ├── polkadot/   # Polkadot support
│   │   └── ton/        # TON support
│   ├── controllers/    # State management (valtio-based)
│   ├── ui/             # Atomic Web Components (LitElement, wui-* prefix)
│   ├── scaffold-ui/    # High-level UI flows (w3m-* prefix)
│   ├── common/         # Shared utilities
│   ├── appkit-utils/   # Multi-chain utilities
│   ├── siwe/           # Sign-In With Ethereum
│   ├── siwx/           # Cross-chain authentication
│   ├── wallet/         # Embedded wallet provider
│   └── ...             # Other utility packages
├── apps/               # Internal applications
│   ├── laboratory/     # Primary E2E testing app (Next.js + Playwright)
│   ├── demo/           # Marketing/demo application
│   ├── gallery/        # Storybook component gallery
│   └── browser-extension/
├── examples/           # Integration examples ({framework}-{adapter} pattern)
└── .github/            # CI/CD workflows
```

## Key Commands

All commands should be run from the repository root using pnpm:

```bash
# Install dependencies
pnpm install

# Build all packages (required before running apps)
pnpm build

# Format code with Prettier (run before committing)
pnpm run prettier:format

# Run unit tests (Vitest)
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run the Laboratory app for testing
pnpm laboratory

# Run the demo app
pnpm demo:dev

# Run the component gallery (Storybook)
pnpm gallery

# Create a changeset for versioning
pnpm changeset

# Check bundle size
pnpm size
```

## Architecture Overview

### Core Packages

The `@reown/appkit` package is the main entry point. It initializes via `createAppKit()` with configuration for networks, adapters, and features. The `AppKitBaseClient` class manages adapters, controllers, and connection lifecycle.

### Adapters

Each blockchain adapter implements the `AdapterBlueprint` interface with standard methods: `connect()`, `disconnect()`, `signMessage()`, `sendTransaction()`, `switchNetwork()`. Adapters emit events for `accountChanged`, `disconnect`, and `switchNetwork`.

### Controllers

State management uses valtio proxies. Key controllers include `ChainController` (multi-namespace blockchain state), `ConnectionController` (wallet connection lifecycle), `ModalController` (UI modal visibility), and `OptionsController` (feature flags and configuration).

### UI Components

The UI layer consists of atomic Web Components (`wui-*` prefix) from `@reown/appkit-ui` built with LitElement, and high-level scaffold components (`w3m-*` prefix) from `@reown/appkit-scaffold-ui` that compose the atoms and subscribe to controllers.

### Chain Namespaces

Blockchain ecosystems are identified by namespace: `eip155` (EVM), `solana`, `bip122` (Bitcoin), `polkadot`, and `ton`. These are used as keys in the `ChainController.chains` Map.

## Development Notes

### Code Quality Standards

When creating new UI components in `packages/ui/`, components must apply `resetStyles`, use the `wui-` prefix, and include required section comments (`// -- Render ----`, `// -- State & Properties ----`, `// -- Private ----`). New components require corresponding Storybook stories in `apps/gallery/`.

When creating new scaffold components in `packages/scaffold-ui/`, components must use the `w3m-` prefix, include proper unsubscribe logic for controller subscriptions, and use relative imports instead of direct package access.

Controllers in `packages/controllers/` must include section comments (`// -- Types ----`, `// -- State ----`, `// -- Controller ----`), use `valtio/vanilla` instead of `valtio`, and have corresponding tests.

### Import Rules

Use relative imports within packages instead of direct package access. Client packages (wagmi, solana, ethers, ethers5) cannot import from `@reown/appkit-controllers` or `@reown/appkit-ui`. The UI package cannot import from `@reown/appkit-controllers`.

### Testing

Unit tests use Vitest and are located alongside source files or in `test/` directories. E2E tests use Playwright in the Laboratory app (`apps/laboratory/tests/`). The Laboratory app uses Page Object Model pattern with `ModalPage`, `WalletPage`, and corresponding validators.

Tests for scaffold-ui partials should be placed in `packages/scaffold-ui/test/partials/` with naming convention `[component-name].test.ts`.

### PR Requirements

Before submitting a PR, run `pnpm build` and `pnpm run prettier:format`. Use conventional commit format for PR titles (e.g., `feat: add new feature`, `fix: resolve bug`, `chore: update dependencies`). Bug fixes and new features require tests. Large changes should be discussed in an issue first.

The repository uses DangerJS for automated PR checks including package dependency validation, architectural boundary enforcement, security scanning, and breaking change detection.

## Versioning and Publishing

### Changesets

The repository uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. All `@reown/appkit-*` packages are versioned together as a fixed group.

To create a changeset for your changes:

```bash
pnpm changeset
```

This will prompt you to select affected packages and describe the changes. Changesets are stored in `.changeset/` as markdown files.

### Release Channels

The repository supports multiple release channels:

- `latest` - Stable production releases
- `alpha` - Alpha pre-releases
- `beta` - Beta pre-releases
- `canary` - Canary releases for testing

### Publishing Workflow

Publishing is handled through GitHub Actions workflows:

- `release-start.yml` - Initiates the release process
- `release-publish.yml` - Publishes packages to npm
- `release-canary.yml` - Publishes canary releases
- `publish-prerelease.yml` - Publishes alpha/beta pre-releases

The `@examples/*` and `@apps/*` packages are excluded from publishing.

### CI/CD

PR checks include setup and build, code style validation, unit tests, bundle size checks, and UI tests. The UI tests run in the Laboratory app using Playwright with sharded execution across multiple runners.

Canary tests run in Docker containers and upload timing metrics to CloudWatch for performance monitoring.
