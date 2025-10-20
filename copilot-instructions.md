# Copilot Code Review Instructions

## Context: Polkadot Integration into Reown AppKit Fork

We are introducing Polkadot support into a Reown AppKit fork. All new Polkadot implementations must follow existing, battle-tested patterns from Solana, EVM (Wagmi/Ethers), and Bitcoin integrations.

## Review Focus Areas

### 1. Adapter Pattern Consistency

**Compare against:**

- `packages/adapters/wagmi/` (EVM reference)
- `packages/adapters/solana/`
- `packages/adapters/bitcoin/`
- `packages/adapters/ethers/`
- `packages/adapters/ethers5/`

**What to check:**

- Does the Polkadot adapter follow the same structural patterns as existing adapters?
- Are lifecycle methods (initialization, connection, disconnection) implemented consistently?
- Does it properly use `peerDependencies` for ecosystem SDKs and `optionalDependencies` for optional wallet providers?
- Is the adapter framework-agnostic with explicit React/Vue subpath exports where needed?
- Does it properly integrate with `@reown/appkit-controllers` without leaking implementation details?

### 2. Package Structure and Exports

**Compare against existing adapter packages:**

**What to check:**

- Is `package.json` configured correctly with ESM (`"type": "module"`)?
- Are `exports` maps properly defined for subpaths (e.g., `./react`, `./vue`)?
- Are dependencies categorized correctly (workspace:\* for internal, peerDependencies for host SDKs)?
- Is `"sideEffects": false` set appropriately?
- Does the build output follow the standard `dist/esm/` and `dist/types/` structure?
- Are TypeScript configs (`tsconfig.json`, `tsconfig.build.json`) consistent with other adapters?

### 3. Connection Management

**Compare against:**

- Solana: `packages/adapters/solana/src/client.ts` for wallet-standard connections
- Wagmi: `packages/adapters/wagmi/src/client.ts` for connector patterns
- Bitcoin: `packages/adapters/bitcoin/src/client.ts` for provider management

**What to check:**

- Does connection establishment follow the same pattern?
- Are connection states properly synchronized with `@reown/appkit-controllers`?
- Is error handling consistent (try/catch patterns, error types)?
- Are wallet discovery and enumeration handled similarly?
- Does it properly handle connection events (connect, disconnect, account change, network change)?

### 4. Controller Integration

**Compare against:**

- How Solana integrates with `AccountController`, `NetworkController`, `ConnectionController`
- How EVM adapters sync state with controllers
- How Bitcoin manages chain-specific state

**What to check:**

- Does the Polkadot adapter properly update controller state?
- Are state subscriptions using `valtio` patterns correctly?
- Does it respect the unidirectional data flow (adapters -> controllers -> UI)?
- Are chain-specific abstractions properly mapped to AppKit domain types?

### 5. Testing Patterns

**Compare against:**

- `packages/adapters/wagmi/tests/`
- `packages/adapters/solana/tests/`
- `packages/adapters/bitcoin/tests/`

**What to check:**

- Are there equivalent test cases for core functionality (connect, disconnect, sign, send)?
- Does it use `vitest` with the same configuration patterns?
- Are mocks and test utilities structured similarly?
- Is test coverage comparable to existing adapters?
- Do tests cover error cases and edge conditions?

### 6. Utility Functions and Helpers

**Compare against:**

- `packages/appkit-utils/src/EthersHelpersUtil.ts`
- `packages/appkit-utils/src/SolanaHelpersUtil.ts`
- `packages/appkit-utils/src/BitcoinUtil.ts`

**What to check:**

- Are chain-specific utilities properly placed in `@reown/appkit-utils`?
- Do helper functions follow the same naming conventions (`PolkadotHelpersUtil`)?
- Is address validation, formatting, and parsing consistent with other chains?
- Are transaction building and signing patterns similar?

### 7. Network and Chain Configuration

**Compare against:**

- `packages/appkit/src/networks/solana/`
- `packages/appkit/src/networks/bitcoin/`
- EVM chain definitions in `@reown/appkit/networks`

**What to check:**

- Are network definitions structured consistently?
- Do they export the same metadata fields (name, chainId, currency, RPC endpoints)?
- Are network icons and branding handled the same way?
- Does it follow the same pattern for testnet vs mainnet configurations?

### 8. UI Integration

**Compare against:**

- How Solana wallet lists are rendered in `@reown/appkit-scaffold-ui`
- How EVM connector lists work
- Chain-specific UI components for Bitcoin

**What to check:**

- Are wallet/connector lists displayed using existing UI patterns?
- Does it reuse `wui-*` components from `@reown/appkit-ui`?
- Are chain-specific flows (if any) placed in `@reown/appkit-scaffold-ui`?
- Is business logic kept out of UI components?

### 9. Import Boundaries and Layering

**Enforce architecture rules:**

**What to check:**

- Does the Polkadot adapter only import from lower layers (`common`, `controllers`, `utils`, `wallet`)?
- Are there any upward imports that violate layering (adapter importing from `appkit` facade)?
- Are all imports using package entrypoints or declared subpaths (no deep imports)?
- Is the dependency graph acyclic?

### 10. Type Safety and API Design

**Compare against existing adapter APIs:**

**What to check:**

- Are types properly exported via `export type` for tree-shaking?
- Are third-party SDK types wrapped/mapped to internal domain types at boundaries?
- Is TypeScript `strict` mode enabled and respected (no `any` usage)?
- Are discriminated unions used for variant states?
- Are parameter objects used over positional arguments for complex functions?

## Common Anti-Patterns to Flag

1. **Deep imports**: `import X from '@reown/appkit-controllers/dist/...'` ❌
2. **Upward imports**: Adapter importing from `@reown/appkit` facade ❌
3. **Missing peer dependencies**: Bundling ecosystem SDKs instead of declaring them as peers ❌
4. **Side effects**: Top-level side effects that break tree-shaking ❌
5. **Business logic in UI**: Controllers/data-fetching in UI components ❌
6. **Inconsistent error handling**: Not following existing try/catch and error-typing patterns ❌
7. **Missing tests**: Functionality without equivalent test coverage compared to other adapters ❌
8. **Inconsistent naming**: Not following `PolkadotXUtil`, `PolkadotAdapter` naming conventions ❌
9. **Direct window access**: Browser-specific code without SSR guards ❌
10. **Type leakage**: Polkadot-specific SDK types exposed across package boundaries ❌

## Review Checklist

For each Polkadot-related file changed:

- [ ] Find the equivalent implementation in Solana/EVM/Bitcoin
- [ ] Compare structure and patterns
- [ ] Verify dependency declarations match adapter patterns
- [ ] Check for proper controller integration
- [ ] Ensure tests exist with similar coverage
- [ ] Validate import paths and layering
- [ ] Confirm types are properly isolated
- [ ] Verify error handling follows established patterns
- [ ] Check for SSR compatibility if applicable
- [ ] Ensure no shortcuts or workarounds that other adapters don't use

## Questions to Ask in Review

1. "Does this Polkadot implementation have an equivalent in the Solana/EVM/Bitcoin adapters?"
2. "Why does this deviate from the pattern used in [existing adapter]?"
3. "Are we reinventing something that already exists in `@reown/appkit-utils` or `@reown/appkit-controllers`?"
4. "Could this be abstracted to work across multiple chains instead of being Polkadot-specific?"
5. "Have we tested this the same way the equivalent Solana/EVM/Bitcoin functionality is tested?"

## Success Criteria

A Polkadot PR is ready to merge when:

✅ Every major feature has a clear equivalent in at least one existing adapter (Solana/EVM/Bitcoin)  
✅ Package structure matches existing adapter conventions exactly  
✅ Test coverage is comparable to battle-tested adapters  
✅ All imports respect the layered architecture  
✅ No anti-patterns from the list above are present  
✅ Code review explicitly confirms pattern consistency with existing implementations

---

**Remember**: Solana, EVM, and Bitcoin implementations are the source of truth. When in doubt, copy their patterns rather than innovating new approaches.
