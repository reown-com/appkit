# Package Reference

All packages are ESM (`"type": "module"`) with `sideEffects: false`.

## Package Map

### Core SDK

| Package                 | npm Name                    | Purpose                                                                                                                                   |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/appkit`       | `@reown/appkit`             | Main SDK entry point and facade. Re-exports subdomains via subpath exports (`./react`, `./vue`, `./utils`, `./adapters`, `./connectors`). |
| `packages/common`       | `@reown/appkit-common`      | Shared types, math/date utils, light helpers. Zero heavy dependencies.                                                                    |
| `packages/controllers`  | `@reown/appkit-controllers` | Stateful business logic with valtio. Optional `./react` and `./vue` subpaths.                                                             |
| `packages/appkit-utils` | `@reown/appkit-utils`       | Integration helpers per chain family (Ethers, Solana, Bitcoin, Wallet Standard).                                                          |
| `packages/wallet`       | `@reown/appkit-wallet`      | Wallet models, schema validation, core wallet utilities.                                                                                  |

### UI

| Package                  | npm Name                      | Purpose                                                                              |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| `packages/ui`            | `@reown/appkit-ui`            | Atomic Web Components (Lit). 100+ `wui-*` components. No business logic.             |
| `packages/scaffold-ui`   | `@reown/appkit-scaffold-ui`   | High-level UI flows: modal, router, views, partials. Composes `wui-*` + controllers. |
| `packages/wallet-button` | `@reown/appkit-wallet-button` | Standalone wallet button component. Optional `@lit/react` wrapper.                   |

### Adapters

| Package                      | npm Name                         | Ecosystem          |
| ---------------------------- | -------------------------------- | ------------------ |
| `packages/adapters/wagmi`    | `@reown/appkit-adapter-wagmi`    | EVM via Wagmi/Viem |
| `packages/adapters/ethers`   | `@reown/appkit-adapter-ethers`   | EVM via ethers v6  |
| `packages/adapters/ethers5`  | `@reown/appkit-adapter-ethers5`  | EVM via ethers v5  |
| `packages/adapters/solana`   | `@reown/appkit-adapter-solana`   | Solana             |
| `packages/adapters/bitcoin`  | `@reown/appkit-adapter-bitcoin`  | Bitcoin            |
| `packages/adapters/polkadot` | `@reown/appkit-adapter-polkadot` | Polkadot (private) |
| `packages/adapters/ton`      | `@reown/appkit-adapter-ton`      | TON                |

### Auth & Payments

| Package         | npm Name             | Purpose                                    |
| --------------- | -------------------- | ------------------------------------------ |
| `packages/siwe` | `@reown/appkit-siwe` | Sign-In With Ethereum                      |
| `packages/siwx` | `@reown/appkit-siwx` | Cross-chain Sign-In (EVM, Solana, Bitcoin) |
| `packages/pay`  | `@reown/appkit-pay`  | Payment flows (UI + state)                 |

### Infrastructure

| Package                        | npm Name                            | Purpose                                       |
| ------------------------------ | ----------------------------------- | --------------------------------------------- |
| `packages/universal-connector` | `@reown/appkit-universal-connector` | Bridge to `@walletconnect/universal-provider` |
| `packages/polyfills`           | `@reown/appkit-polyfills`           | Browser Buffer and similar shims              |
| `packages/cdn`                 | `@reown/appkit-cdn`                 | Pre-bundled CDN builds (not tree-shaken)      |
| `packages/experimental`        | `@reown/appkit-experimental`        | Gated/unstable features (smart sessions)      |

### Tooling

| Package                | npm Name                | Purpose                                   |
| ---------------------- | ----------------------- | ----------------------------------------- |
| `packages/testing`     | `@reown/appkit-testing` | Test harnesses, Playwright utilities      |
| `packages/cli`         | `@reown/appkit-cli`     | Scaffolding/utility CLI                   |
| `packages/codemod`     | `@reown/appkit-codemod` | Upgrade helpers for dependency migrations |
| `packages/core-legacy` | `@reown/appkit-core`    | Legacy compatibility wrapper              |

## Build Outputs

```
dist/
├── esm/        # ES module JavaScript
└── types/      # TypeScript declarations
```

## Package.json Conventions

```json
{
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js"
    },
    "./react": {
      "types": "./dist/types/react/index.d.ts",
      "import": "./dist/esm/react/index.js"
    }
  },
  "files": ["dist", "README.md"]
}
```

## Scripts (per package)

| Script        | Command                                        |
| ------------- | ---------------------------------------------- |
| `build:clean` | Remove `dist/`                                 |
| `build`       | `tsc --build` (some use `tsconfig.build.json`) |
| `watch`       | `tsc --watch`                                  |
| `typecheck`   | `tsc --noEmit`                                 |
| `lint`        | ESLint                                         |
| `test`        | Vitest                                         |

## Adding a New Package

1. Create `packages/<name>/` with ESM config, `exports` map, `files: ["dist", "README.md"]`, `sideEffects: false`
2. Use `workspace:*` for internal deps, `peerDependencies` for host libs, `optionalDependencies` for optional providers
3. Add `vitest.config.ts` and `tests/` directory
4. Expose subpaths deliberately — only when stable and necessary
5. Run `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`
6. Add to `pnpm-workspace.yaml`
