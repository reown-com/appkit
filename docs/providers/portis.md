# Portis

1. Install Provider Package

```bash
npm install --save @portis/web3

# OR

yarn add @portis/web3
```

2. Set Provider Options

```typescript
import Portis from "@portis/web3";

const providerOptions = {
  portis: {
    package: Portis, // required
    options: {
      id: "PORTIS_ID" // required
    }
  }
};
```

**Note:** A Portis instance is available on the provider as `provider._portis`
