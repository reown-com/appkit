---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-scaffold-ui': patch
---

Fixed network switch failures being silently swallowed instead of shown to the user (network list, wallet-switch, and unsupported-chain flows). Added an explicit `wallet_addEthereumChain` fallback to the wagmi adapter for chains a wallet doesn't yet recognize, matching existing ethers/ethers5 behavior. Also added a success animation and auto-close-modal behavior when switching networks from the network list.
