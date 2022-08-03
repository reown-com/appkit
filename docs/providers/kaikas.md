# Kaikas

1. Install Provider Package 

```bash
npm install --save @klaytn/kaikas-web3-provider
```

2. Set Provider Options

```typescript
import { KaikasWeb3Provider } from "@klaytn/kaikas-web3-provider"

const providerOptions = {
  kaikas: {
    package: KaikasWeb3Provider // required
  }
};
```