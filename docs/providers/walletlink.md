# Coinbase Wallet SDK

1. Install Provider Package

```bash
npm install --save @coinbase/wallet-sdk

# OR

yarn add @coinbase/wallet-sdk
```

2. Set Provider Options

```typescript
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import WalletConnect from "@walletconnect/web3-provider";

const providerOptions = {
  walletlink: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "My Awesome App", // Required
      infuraId: "INFURA_ID", // Required
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  },
  walletconnect: {
   package: WalletConnect, 
   options: {
      infuraId: "INFURA_ID",
   }
  }
};
```

[For more information on CoinbaseWallet Web3 provider](https://docs.cloud.coinbase.com/wallet-sdk/docs).
