# Frame

1. Install Provider Package

```bash
npm install --save eth-provider
# OR
yarn add eth-provider
```

2. Set Provider Options

```typescript
import ethProvider from "eth-provider";
const providerOptions = {
  frame: {
    package: ethProvider // required
  }
};
```
