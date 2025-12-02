---
"@reown/appkit-adapter-ethers": patch
"@reown/appkit-adapter-ethers5": patch
"@reown/appkit-utils": patch
---

feat: add wallet_connect RPC method for Base Account authentication

Added support for the new Base Account SDK `wallet_connect` RPC method in the Ethers and Ethers5 adapters. This enables proper authentication using SIWE (Sign-In With Ethereum) capabilities when connecting with Base Account.

**What changed:**
- Added `wallet_connect` RPC method handling for Base Account connections
- Updated error message to reflect "Base Account SDK" branding
- Bumped `@base-org/account` to v2.5.0

**Why:**
The Base Account SDK now uses a `wallet_connect` RPC method with SIWE capabilities for authentication, replacing the standard `eth_requestAccounts` flow.

**Reference:** https://docs.base.org/base-account/quickstart/web
