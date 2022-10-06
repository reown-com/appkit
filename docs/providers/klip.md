# Klip Wallet

1. Install Provider Package

```bash
npm install --save @klaytn/klip-web3-provider
# OR
yarn add @klaytn/klip-web3-provider
```

2. Set Provider Options

```typescript
import { KlipWeb3Provider } from "@klaytn/klip-web3-provider"
const providerOptions = {
    klip: {
        package: KlipWeb3Provider // required
        options: {
            bappName: "web3Modal Example App", //required
            rpcUrl: "RPC_URL" //required
        }
    }
};
```