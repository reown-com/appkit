# Arkane

1. Install Provider Package

```bash
npm install --save @arkane-network/web3-arkane-provider

# OR

yarn add @arkane-network/web3-arkane-provide
```

2. Set Provider Options

```typescript
import Arkane from "@arkane-network/web3-arkane-provider";

const providerOptions = {
  arkane: {
    package: Arkane, // required
    options: {
      clientId: "ARKANE_CLIENT_ID" // required
    }
  }
};
```
