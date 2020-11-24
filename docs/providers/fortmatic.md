# Fortmatic

1. Install Provider Package

```bash
npm install --save fortmatic

# OR

yarn add fortmatic
```

2. Set Provider Options

```typescript
import Fortmatic from "fortmatic";

const providerOptions = {
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: "FORTMATIC_KEY" // required
    }
  }
};
```

**Note:** A Fortmatic instance is available on the provider as `provider.fm`
