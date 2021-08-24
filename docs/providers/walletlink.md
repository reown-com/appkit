# WalletLink / Coinbase Wallet

1. Install Provider Package

```bash
npm install --save walletlink

# OR

yarn add walletlink
```

2. Set Provider Options

```typescript
import WalletLink from "walletlink";

const providerOptions = {
  walletlink: {
    package: WalletLink,           // required
    options: {
      appName: "Your Dapp Name",   // required
      appLogoUrl: "DAPP_LOGO_URL", // optional - favicon is used if unspecified
      darkMode: false,             // optional - false if unspecified
      walletLinkUrl: "SERVER_URL", // optional - WalletLink server URL; for most, leave it unspecified
      jsonRpcUrl: "JSON_RPC_URL",  // required
      chainId: 1                   // optional - 1 is used if unspecified
    }
  }
};
```

[See the full list of options for WalletLink Web3 provider](https://github.com/walletlink/walletlink#initializing-walletlink-and-a-walletlink-powered-web3-object).
