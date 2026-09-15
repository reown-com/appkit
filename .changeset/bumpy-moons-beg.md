---
'@reown/appkit-adapter-tron': patch
'@reown/appkit-utils': patch
---

Fixed TRON `sendTransaction` failing on chains outside the Blockchain API's supported list (e.g. Shasta testnet) by falling back to calling the chain's fullnode directly. Also fixed network switching not reaching the underlying wallet adapter for injected TRON connectors.
