# Authereum

1. Install Provider Package

```bash
npm install --save authereum

# OR

yarn add authereum
```

2. Set Provider Options

```typescript
import Authereum from "authereum";

const providerOptions = {
  authereum: {
    package: Authereum // required
  }
};
```

**Note:** An Authereum instance is available on the provider as `provider.authereum`
