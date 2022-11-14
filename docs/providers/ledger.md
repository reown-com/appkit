# Ledger

1. Install Provider Package

```bash
npm install --save @ledgerhq/connect-kit-loader

# OR

yarn add @ledgerhq/connect-kit-loader
```

2. Set Provider Options

```typescript
import { loadConnectKit } from '@ledgerhq/connect-kit-loader';

const providerOptions = {
  ledger: {
    package: loadConnectKit,  // required
    opts: {
      chainId: 1,               // defaults to 1
      infuraId: "INFURA_ID"     // required if no rpc
      rpc: {                    // required if no infuraId
        1: "INSERT_MAINNET_RPC_URL",
        137: "INSERT_POLYGON_RPC_URL",
        // ...
      }
    }
  }
};
```