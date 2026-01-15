# AGENTS.md - AI Agent Guidance for Reown AppKit

This document provides AI agents with essential information about the Reown AppKit repository.

## Project Overview

**Reown AppKit** (formerly Web3Modal) is a full-stack toolkit for building onchain app UX. It enables developers to integrate wallet connections, crypto swaps, on-ramp functionality, and authentication into web applications.

**Key Features:**
- Multi-wallet support with customizable connections
- Email and social login (embedded wallets)
- Crypto swaps and on-ramp
- Smart accounts (sponsored transactions)
- Sign-In With Ethereum (SIWE) and Sign with X (SIWX)
- Telegram Mini Apps integration

**Supported Chains:** EVM (Ethereum, etc.), Solana, Bitcoin, Polkadot, TON

**Multi-Framework:** React, Vue, and Lit (web components)

**License:** Reown AppKit Community License

## Repository Structure

```
packages/
├── appkit/              # Main SDK with multi-framework exports
├── appkit-ui/           # Web component UI library (wui-* prefix)
├── appkit-common/       # Shared utilities (big.js, viem, dayjs)
├── appkit-utils/        # Helper utilities
├── controllers/         # State management and business logic
├── scaffold-ui/         # UI scaffolding components
├── wallet/              # Wallet management
├── wallet-button/       # Dedicated wallet button component
├── siwe/                # Sign-In With Ethereum implementation
├── siwx/                # Sign with X authentication
├── pay/                 # Payment/swap functionality
├── cdn/                 # CDN distribution bundle
├── cli/                 # Command-line interface
├── codemod/             # Code migration tools
├── testing/             # Testing utilities and fixtures
├── polyfills/           # Browser polyfills
├── experimental/        # Experimental features
├── adapters/
│   ├── wagmi/           # Primary EVM adapter (Wagmi/Viem)
│   ├── ethers/          # Ethers.js v6 integration
│   ├── ethers5/         # Ethers.js v5 integration
│   ├── solana/          # Solana support
│   ├── bitcoin/         # Bitcoin support
│   ├── polkadot/        # Polkadot support
│   └── ton/             # TON blockchain support
apps/
├── demo/                # Main demo/builder application
├── laboratory/          # Testing laboratory app
├── gallery/             # Component gallery showcase
├── browser-extension/   # Browser wallet extension
└── pay-test-exchange/   # Payment exchange testing
examples/                # 48+ example apps (React, Vue, Next.js, Nuxt, etc.)
services/                # Supporting services (id-allocation-service)
```

## Key Commands

### Setup
```bash
pnpm install             # Install all dependencies
```

### Building
```bash
pnpm build               # Build all packages (excludes CDN)
pnpm build:all           # Build all packages including CDN
pnpm watch               # Watch mode for development
pnpm build:clean         # Clean build artifacts
```

### Testing
```bash
pnpm test                # Run Vitest test suite
pnpm test:coverage       # Run tests with HTML coverage report
pnpm test:ci             # CI mode with JSON coverage reporters
```

### Code Quality
```bash
pnpm lint                # Run ESLint
pnpm prettier            # Check formatting
pnpm prettier:format     # Auto-fix formatting
pnpm typecheck           # Run TypeScript type checking
pnpm test:static         # Run all checks: typecheck + lint + prettier
pnpm size                # Check bundle sizes against limits
```

### Running Apps
```bash
pnpm gallery             # Run component gallery
pnpm laboratory          # Run testing laboratory
pnpm demo:dev            # Run demo/builder in dev mode
pnpm examples            # Run all example apps
pnpm browser-extension   # Run browser extension dev server
```

### Release Management
```bash
pnpm changeset           # Create a new changeset
pnpm changeset:version   # Bump versions from changesets
pnpm publish:latest      # Publish production release
pnpm publish:alpha       # Publish alpha pre-release
pnpm publish:beta        # Publish beta pre-release
pnpm publish:canary      # Publish canary build
```

## Architecture Overview

### Package Management
- **pnpm 9.5.0** with workspaces for monorepo management
- **Turborepo 2.5.8** for build orchestration and caching

### Build System
- **Vite** for bundling and dev server
- **TypeScript 5.8.3** with strict mode enabled
- Target: ES2021, ESNext module system

### UI Components
- **Lit 3.x** for web components
- All UI components use `wui-` prefix
- Import custom elements from `@reown/appkit-ui`, not directly from Lit

### State Management
- Custom controllers pattern in `packages/controllers`
- Reactive state with Valtio proxy-based updates
- See [Controllers Guide](.context/controllers.md) for full list

### Client Architecture
- **AppKitBaseClient** - Abstract base with shared logic
- **AppKit (full)** - Includes embedded wallet auth and full modal UI
- **AppKit (core)** - Lightweight variant with `basic: true` flag
- See [Client Architecture Guide](.context/client-architecture.md) for details

### Hooks & Composables
- React hooks and Vue composables for framework integration
- Interact with Valtio controllers for reactive state
- See [Hooks Guide](.context/hooks.md) for complete list

### Bundling & Imports
- 13 entry points for different frameworks and use cases
- Framework-specific: `@reown/appkit/react`, `@reown/appkit/vue`
- Core variants: `@reown/appkit/core`, `@reown/appkit/react-core`
- See [Bundling Guide](.context/bundling.md) for import structure

### Testing
- **Vitest** for unit and integration tests (jsdom environment)
- **Playwright** for E2E tests (Chromium and Firefox)
- Test sharding for parallel CI execution

### Linting & Formatting
- **ESLint** with strict TypeScript rules
- **Prettier** with custom import sorting
- Single quotes, no semicolons, no trailing commas

### Bundle Size
- **size-limit** tracks bundle sizes
- Key limits: appkit core (80KB), react (235KB), ui (500KB)

## Detailed Architecture Guides

For in-depth information, see the following guides in `.context/`:

| Guide | Description |
|-------|-------------|
| [Controllers](.context/controllers.md) | 25 Valtio controllers and their responsibilities |
| [Client Architecture](.context/client-architecture.md) | AppKitBaseClient, AppKit (full), AppKit (core) class hierarchy |
| [Hooks](.context/hooks.md) | React hooks and Vue composables with usage examples |
| [Bundling](.context/bundling.md) | Export structure, entry points, and import patterns |

## Development Notes

### Code Style
- Use function declarations, not function expressions
- Single quotes for strings
- No semicolons
- No trailing commas
- Print width: 100 characters
- Tab width: 2 spaces

### TypeScript
- Strict mode enforced (`strict: true`)
- No unused locals or parameters
- No implicit returns
- Verbatim module syntax

### Import Order (enforced by Prettier plugin)
1. React imports
2. Third-party packages
3. Lit imports
4. `@reown/*` packages
5. `@/` aliases
6. Relative imports

### Custom Element Imports
**Important:** Import custom element decorators from `@reown/appkit-ui`, not directly from `lit/decorators.js`.

### Contributing
- Large features require an Issue first
- Bug fixes can go directly to PRs
- All code must pass linting and type checking
- Tests required for new features and refactors
- Use PR templates to explain changes

## Versioning/Publishing

### Changesets
This repository uses **Changesets** for semantic versioning in the monorepo.

**Fixed Versioning:** All `@reown/appkit` and `@reown/appkit-*` packages are released together with the same version.

### Release Channels
- `latest` - Stable production releases
- `alpha` - Alpha pre-releases
- `beta` - Beta pre-releases
- `canary` - Continuous builds from main branch

### Release Process
1. **Create changeset:** Developers run `pnpm changeset` and commit the changeset file
2. **Start release:** Maintainers trigger `release-start.yml` workflow
3. **Version PR:** Workflow creates a release branch and opens a version PR
4. **Publish:** Merging triggers `release-publish.yml` which publishes to npm
5. **Sync back:** A PR is opened to merge release changes back to main

### Canary Releases
Every push to `main` automatically triggers a canary release via `release-canary.yml`.

### Minimum Release Age
Changesets must be at least **3 days old** before they can be included in a release. This is configured in `pnpm-workspace.yaml`.

### Ignored Packages
The following are not published to npm:
- `@examples/*` - Example applications
- `@apps/*` - Internal apps
- `@reown/appkit-adapter-polkadot` - Not yet stable

### GitHub Actions Workflows
- `release-start.yml` - Initiate release process (manual trigger)
- `release-publish.yml` - Publish to npm (triggered on release branch push)
- `release-canary.yml` - Auto-publish canary on main push
- `publish-prerelease.yml` - Manual pre-release from any branch
