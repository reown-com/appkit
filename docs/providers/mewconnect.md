# MEW connect protocol (MEW wallet)

1. Install Provider Package

```bash
npm install --save @myetherwallet/mewconnect-web-client

# OR

yarn add @myetherwallet/mewconnect-web-client
```

2. Set Provider Options

```typescript
import MewConnect from "@myetherwallet/mewconnect-web-client";

const providerOptions = {
  mewconnect: {
    package: MewConnect, // required
    options: {
      infuraId: "INFURA_ID" // required
    }
  }
};
```
