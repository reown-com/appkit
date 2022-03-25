# Venly (Previously Arkane Network)

1. Install Provider Package

```bash
npm install --save @venly/web3-provider

# OR

yarn add @venly/web3-provider
```

2. Set Provider Options

```typescript
import { Venly } from "@venly/web3-provider";

const providerOptions = {
  venly: {
    package: Venly, // required
    options: {
      clientId: "VENLY_CLIENT_ID" // required
    }
  }
};
```
