# Changelog

## [Unreleased]

### Breaking Changes

- **REMOVED**: Wallet guide component (`w3m-wallet-guide`) and related functionality (APKT-2883)
  - Removed "Haven't got a wallet?" button component that was causing UI bugs
  - Removed `enableWalletGuide` configuration option from AppKit options
  - Removed `WalletGuideType` type definitions
  - Removed 'Create' route from router
  - This addresses issues where the top section was empty when email/social was disabled and users clicked the button
  - Also fixes duplicate "or" separator display when email/social was enabled

### Migration Guide

If you were using the `enableWalletGuide` option in your AppKit configuration, you can safely remove it as this feature has been completely removed.

```typescript
// Before
createAppKit({
  // ... other options
  enableWalletGuide: false // Remove this line
})

// After
createAppKit({
  // ... other options
  // enableWalletGuide option no longer exists
})
```
