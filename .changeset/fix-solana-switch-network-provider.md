---
"@reown/appkit-adapter-solana": patch
"@reown/appkit": patch
---

fix(solana): sync walletProvider after switchNetwork for non-AUTH providers

`useAppKitProvider` returned a stale provider after calling `switchNetwork` because
the Solana adapter never emitted a `switchNetwork` event for WalletConnect and
standard wallet providers, and the base client's `switchNetwork` handler never
called `syncProvider`. Both are now fixed.
