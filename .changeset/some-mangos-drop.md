---
'@reown/appkit-controllers': patch
'@reown/appkit': patch
'@reown/appkit-common': patch
'@reown/appkit-ui': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-pay': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-testing': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

feat(ui): add CSS variables for input customization

Added `--apkt-input-background` and `--apkt-input-border` CSS variables to allow customization of input fields (email input and OTP boxes) without affecting other components.

Usage:
```css
:root {
  --apkt-input-background: #2D2D2D;
  --apkt-input-border: #9A9A9A;
}
```