---
'@reown/appkit-adapter-wagmi': patch
'@reown/appkit-controllers': patch
'@reown/appkit-scaffold-ui': patch
'@reown/appkit': patch
'@reown/appkit-siwe': patch
'@reown/appkit-siwx': patch
'@reown/appkit-adapter-bitcoin': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
'@reown/appkit-utils': patch
'@reown/appkit-cdn': patch
'@reown/appkit-cli': patch
'@reown/appkit-common': patch
'@reown/appkit-core': patch
'@reown/appkit-experimental': patch
'@reown/appkit-polyfills': patch
'@reown/appkit-ui': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

- 🧩 **Improve DX by extending CloudAuthSIWX support in AppKit**  
  Enable easier and more consistent use of cloud-side authentication features on the client side.

- 📥 **Expose `CloudAuthSIWX` instance from AppKit**  
  Currently stored in AppKit's proxy state and inaccessible—needs to be exposed via hook or getter to allow proper external usage.

- 🧠 **Enable access to SIWX utility**  
  AppKit doesn’t currently expose SIWX, limiting interaction; exposing it allows better integration with authentication flows.

- ✍️ **Use metadata writing for richer auth context**  
  While working on OKX-Airdrop, we saw how writing metadata to session accounts can provide powerful, flexible auth patterns.

- 🔧 **Extend `SIWXConfig` interface**  
  Support app-specific extensions to SIWX through custom methods, exposed via generic getters or hooks, enabling flexible enhancements without altering core behavior.
