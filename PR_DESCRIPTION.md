# feat: Add Polkadot to AUTH_CONNECTOR_SUPPORTED_CHAINS

## Summary

Enable Polkadot namespace filtering in AppKit modal by adding `'polkadot'` to the `AUTH_CONNECTOR_SUPPORTED_CHAINS` array.

## Motivation

Polkadot is already defined in AppKit's `CHAIN` and `CHAIN_NAME_MAP` constants, and there's a `@reown/appkit-adapter-polkadot` package in the monorepo. However, when developers try to filter the AppKit modal by Polkadot namespace using:

```typescript
open({ view: 'Connect', namespace: 'polkadot' })
```

...no wallets are displayed because Polkadot is not included in `AUTH_CONNECTOR_SUPPORTED_CHAINS`.

## Changes

**File**: `packages/common/src/utils/ConstantsUtil.ts`

```diff
- AUTH_CONNECTOR_SUPPORTED_CHAINS: ['eip155', 'solana'] as ChainNamespace[],
+ AUTH_CONNECTOR_SUPPORTED_CHAINS: ['eip155', 'solana', 'polkadot'] as ChainNamespace[],
```

## Impact

- ✅ Developers can now filter AppKit modal to show only Polkadot wallets
- ✅ Polkadot connectors will appear when `namespace: 'polkadot'` is specified
- ✅ No breaking changes to existing functionality
- ✅ Aligns with existing Polkadot support in codebase

## Testing

Tested with:
- SubWallet (Polkadot extension)
- Custom Polkadot adapter implementation
- Namespace filtering: `open({ view: 'Connect', namespace: 'polkadot' })`

**Before**: Modal shows no wallets when filtered by Polkadot namespace  
**After**: Modal correctly displays Polkadot-compatible wallets

## Checklist

- [x] Code follows project style guidelines
- [x] Changes are backward compatible
- [x] No additional dependencies required
- [x] Tested locally with Polkadot wallets
- [ ] Documentation updated (if needed)

## Related

- Polkadot adapter: `packages/adapters/polkadot/`
- Existing constants: `CHAIN.POLKADOT`, `CHAIN_NAME_MAP.polkadot`
- Namespace utilities: `packages/common/src/utils/NetworkUtil.ts` (already includes Polkadot in `AVAILABLE_NAMESPACES`)

## Questions for Reviewers

1. Should this be considered a bug fix or a feature addition?
2. Are there any additional considerations for Polkadot auth flows?
3. Should the Polkadot adapter be promoted from private/experimental status?

