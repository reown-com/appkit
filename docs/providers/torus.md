# Torus

For more info please refer to Torus [documentation](https://docs.tor.us)

1. Install Provider Package

```bash
npm install --save @toruslabs/torus-embed

# OR

yarn add @toruslabs/torus-embed
```

2. Set Provider Options

```typescript
import Torus from "@toruslabs/torus-embed";

const providerOptions = {
  torus: {
    package: Torus, // required
    options: {
      networkParams: {
        host: "https://localhost:8545", // optional
        chainId: 1337, // optional
        networkId: 1337 // optional
      },
      config: {
        buildEnv: "development" // optional
      }
    }
  }
};
```

**Note:** A Torus instance is available on the provider as `provider.torus`
