# BurnerConnect

1. Install Provider Package

```bash
npm install --save @burner-wallet/burner-connect-provider

# OR

yarn add @burner-wallet/burner-connect-provider
```

2. Set Provider Options

```typescript
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";

const providerOptions = {
  burnerconnect: {
    package: BurnerConnectProvider, // required
    options: {
      defaultNetwork: "100"
    }
  }
};
```
