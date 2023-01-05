# Phantom Wallet

1. Set Provider Options

```typescript
const providerOptions = {
  phantom: {
    networkType: "ethereum" // or "solana"
  }
};
```

This will look into `window.phantom[providerOptions.networkType]` to see if `.isPhantom` is true, upon which connection would be initiated.