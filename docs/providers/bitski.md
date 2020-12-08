# Bitski

1. Install Provider Package

```bash
npm install --save bitski
# OR
yarn add bitski
```

2. Set Provider Options

```typescript
import { Bitski } from "bitski";
const providerOptions = {
  bitski: {
    package: Bitski, // required
    options: {
      clientId: "BITSKI_CLIENT_ID", // required
      callbackUrl: "BITSKI_CALLBACK_URL" // required
    }
  }
};
```
