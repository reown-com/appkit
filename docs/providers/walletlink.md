# WalletLink

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
    package: WalletLink, // Required
    options: {
      appName: "My Awesome App", // Required
      infuraId: "INFURA_ID", // Required unless you provide a JSON RPC url; see `rpc` below
      rpc: "", // Optional if `infuraId` is provided; otherwise it's required
      chainId: 1, // Optional. It defaults to 1 if not provided
      appLogoUrl: null, // Optional. Application logo image URL. favicon is used if unspecified
      darkMode: false // Optional. Use dark theme, defaults to false
    }
  }
};
```

[For more information on WalletLink Web3 provider](https://github.com/walletlink/walletlink).
