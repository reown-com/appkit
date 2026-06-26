---
'@reown/appkit-utils': patch
'@reown/appkit': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-codemod': patch
'@reown/appkit-common': patch
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
'@reown/appkit-wallet-button': patch
'@reown/appkit-wallet': patch
'@reown/appkit-controllers': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
---

Expose the headless wallet list imperatively on the AppKit client, so a non-React host can list / search / connect wallets without the `useAppKitWallets` React hook.

New `AppKit` instance methods: `fetchWallets(options?)`, `getWalletList()`, `subscribeWalletList(cb)`, `getWalletConnectUri(options?)`, and `connectWallet(wallet, namespace?, options?)`. The shared imperative logic lives in a new `HeadlessWalletUtil` (`@reown/appkit-controllers`), which both the client methods and the React hook can use — one tested code path for headless wallet listing, search, pagination, the WalletConnect URI, and programmatic connect (injected / API / mobile-deeplink).
