---
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-core': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Added a new `required` option to SIWE/SIWX. This option determines whether the wallet stays connected when the user denies the signature request. If set to `true` it will disconnect the wallet and close the modal. If set to `false` it will close the modal without disconnecting the wallet.

**Example usage**

```ts
import { createSIWEConfig } from '@reown/appkit-siwe'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs } from '@reown/appkit-siwe'

export const siweConfig = createSIWEConfig({
  required: false, // Optional - defaults to true
  getMessageParams: async () => {
    // Return message parameters
  },
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
    // Return formatted message
  },
  getNonce: async () => {
    // Return nonce
  },
  getSession: async () => {
    // Return session
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    // Verify message
  },
  signOut: async () => {
    // Sign out
  }
})
```
