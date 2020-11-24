# D'CENT Wallet

1. Install Provider Package

```bash
npm install --save dcent-provider
# OR
yarn add dcent-provider
```

2. Set Provider Options

```typescript
import DcentProvider from "dcent-provider";
const providerOptions = {
  dcentwallet: {
    package: DcentProvider, // required
    options: {
      rpcUrl: "INSERT_RPC_URL" // required
    }
  }
};
```
