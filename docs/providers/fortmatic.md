# Fortmatic

1. Install Provider Package

```bash
npm install --save fortmatic

# OR

yarn add fortmatic
```

2. Set Provider Options

```typescript
import Fortmatic from "fortmatic";

// Example for Polygon/Matic:
const customNetworkOptions = {
    rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    chainId: 137
}

const providerOptions = {
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: "FORTMATIC_KEY", // required
      network: customNetworkOptions // if we don't pass it, it will default to localhost:8454
    }
  }
};
```

**Note:** A Fortmatic instance is available on the provider as `provider.fm`
