# Coinbase Wallet
_(formerly WalletLink)_

1. Install Provider Package

```bash
npm install --save @coinbase/wallet-sdk

# OR

yarn add @coinbase/wallet-sdk
```

2. Set Provider Options

```typescript
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "My Awesome App", // Required
      infuraId: "INFURA_ID", // Required
      rpc: "", // Optional if `infuraId` is provided; otherwise it's required
      chainId: 1, // Optional. It defaults to 1 if not provided
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  }
};
```

[For more information on Coinbase Wallet Web3 provider](https://docs.cloud.coinbase.com/wallet-sdk/docs).
