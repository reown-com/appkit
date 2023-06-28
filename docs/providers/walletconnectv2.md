# WalletConnect V2.0

1. Install Provider Package

```bash
npm install --save @walletconnect/ethereum-provider

# OR

yarn add @walletconnect/ethereum-provider
```

2. Set Provider Options

```typescript
import WalletConnectV2Provider from "@walletconnect/ethereum-provider";

const providerOptions = {
  walletconnectv2: {
    package: WalletConnectV2Provider, // required
    options: {
      projectId: 'WALLETCONNECT_PROJECT_ID', // required
      chains: [1], // required
      showQrCode: true // requires @walletconnect/modal
    }
  }
};
```

[See the full list of options for WalletConnect Web3 provider](https://docs.walletconnect.com/2.0/web/providers/ethereum).

