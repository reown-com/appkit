# Tally Ho Wallet

[Tally Ho](https://tally.cash/) Wallet works as an injected provider and takes precendence over other installed injected provider wallets if Tally Ho browser extension is installed on the users machine.

However, a product may also want Tally Ho to show as a wallet option if it is not already installed. Setting Tally Ho in the provider options will allow for this.

1. Set Provider Options

```typescript
const providerOptions = {
  tallyhowallet: {
    package: true
  }
};
```