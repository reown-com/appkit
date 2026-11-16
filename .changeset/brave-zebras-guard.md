---
'@reown/appkit': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-stellar': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
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
'@reown/appkit-universal-connector': patch
'@reown/appkit-utils': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
'pay-test-exchange': patch
---

Upgraded `zod` from 3.22.4 to 4.6.7 to address GHSA-mrhx-c7xc-m3w5 (CVE-2023-54404), a memory exhaustion issue when validating large arrays. `validateRequest` error messages in `@reown/appkit-experimental` now use Zod 4 wording, e.g. `Invalid expiry: Invalid input: expected number, received string`.
