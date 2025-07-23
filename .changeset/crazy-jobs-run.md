---
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
'@reown/appkit-controllers': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Introduced `AppKitProvider` React component for easy AppKit integration in React apps

**Example usage**

```jsx
import { AppKitProvider } from '@reown/appkit/react';

function App() {
  return (
    <AppKitProvider projectId="your-project-id" networks={[/* Your Networks */]}>
      {/* Your App */}
    </AppKitProvider>
  );
}
```