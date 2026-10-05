---
'@reown/appkit-ui': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-adapter-stellar': patch
'@reown/appkit-adapter-ton': patch
'@reown/appkit-adapter-tron': patch
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit': patch
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
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

Connects automatically, without the modal, when a wallet opens the app (the wallet injects `window.walletConnectHost`). On startup, if no session was restored, AppKit starts one WalletConnect connection, and Universal Provider hands the pairing URI to the wallet instead of showing a QR code. It only does this once per page load, so a Disconnect doesn't reconnect, and it skips apps that use `manualWCControl`.

On a wallet launch, the connect button shows its loading state until the session is restored or the auto-connect settles, instead of showing "Connect" until the address appears. Regular launches are unchanged.

On a wallet launch AppKit doesn't open the modal by itself: no unsupported network screen and no SIWX sign-in. One-click auth is skipped too, because Universal Provider's `authenticate()` still shows a QR code there. Until that's decided, AppKit logs a warning and connects without authentication.

AppKit and the wagmi adapter now also pick up WalletConnect sessions that Universal Provider creates, restores or updates outside AppKit's connect flow (for example a direct `universalProvider.connect()`).

Updates `@walletconnect/*` to `2.25.1-canary-1`.
