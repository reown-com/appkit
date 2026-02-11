# Contributing & PR Guide

## Before Submitting a PR

Run these from the repo root:

```bash
pnpm build              # Build all packages
pnpm typecheck          # Type checking
pnpm test               # Unit tests
pnpm lint               # Linting
pnpm run prettier:format # Code formatting
```

## Commit & PR Title Format

Use conventional commits:

```
feat: add new wallet connection flow
fix: resolve QR code rendering on mobile
chore: update WalletConnect dependency
refactor: simplify chain switching logic
test: add swap controller tests
docs: update adapter creation guide
```

## Changesets

All publishable changes need a changeset:

```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` describing the change. All `@reown/appkit-*` packages are versioned together as a fixed group.

## DangerJS Automated Checks

Every PR is validated by DangerJS (`dangerfile.ts`). Key checks:

### Dependency Checks

- `pnpm-lock.yaml` must be updated when `package.json` changes
- No `yarn.lock` or `package-lock.json` allowed
- No loose dependency versions (`^`, `~`) except whitelisted packages

### UI Package (`packages/ui/src/`)

- Components must apply `resetStyles`
- No `@state()` decorator allowed
- No imports from `@reown/appkit-controllers`
- Required section comments: `// -- Render ----`, `// -- State & Properties ----`, `// -- Private ----`
- Must use `wui-` prefix
- Must have corresponding Storybook stories

### Scaffold UI (`packages/scaffold-ui/src/`)

- Must use `w3m-` prefix
- Must have proper unsubscribe cleanup
- Must use relative imports

### Controllers (`packages/controllers/src/`)

- Must have section comments: `// -- Types ----`, `// -- State ----`, `// -- Controller ----`
- Must use `valtio/vanilla`
- Must have corresponding tests

## CI/CD Pipeline

PR checks:

1. Setup and build
2. Code style validation (Prettier, ESLint)
3. Unit tests (Vitest)
4. Bundle size checks
5. UI tests (Playwright in Laboratory app, sharded across runners)

## Public API Changes

- The `exports` entrypoints in `packages/appkit/exports/*.ts` define the public SDK surface
- Treat changes to exported functions, classes, or types as potentially breaking
- Follow semver: breaking changes require major bump + clear changeset
- Prefer additive changes; deprecate with `@deprecated` JSDoc first
- Keep exports stable; avoid re-exporting deep internals

## Release Channels

| Channel  | Purpose                     |
| -------- | --------------------------- |
| `latest` | Stable production releases  |
| `alpha`  | Alpha pre-releases          |
| `beta`   | Beta pre-releases           |
| `canary` | Canary releases for testing |

Publishing is handled through GitHub Actions workflows. `@examples/*` and `@apps/*` are excluded.
