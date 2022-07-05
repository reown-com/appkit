# Web3Auth

1. Install Provider Package

```bash
npm install --save @web3auth/web3auth

# OR

yarn add @web3auth/web3auth
```

2. Set Provider Options

```typescript
import { Web3Auth } from "@web3auth/web3auth"

const providerOptions = {
  web3auth: {
    package: Web3Auth, // required
    options: {
      infuraId: "INFURA_ID" // required
    }
  }
};
```

[See the full list of options for WalletConnect Web3 provider](https://web3auth.io/docs/api-reference/web/providers/).

