# Infinity Wallet

1. Install Provider Package

```bash
npm install --save @infinitywallet/infinity-connector

# OR

yarn add @infinitywallet/infinity-connector
```

2. Set Provider Options

```typescript
import * as InfinityWalletConnect from '@infinitywallet/infinity-connector';

const providerOptions = {
  infinitywallet: {
    package: InfinityWalletConnect
  }
};
```
