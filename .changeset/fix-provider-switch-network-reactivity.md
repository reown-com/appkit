---
'@reown/appkit': patch
'@reown/appkit-controllers': patch
---

Fix `useAppKitProvider` not re-rendering after `switchNetwork` in React and Vue. The provider reference is intentionally shared across chains within a namespace, so consumers wrapping it in chain-bound objects (e.g. ethers `BrowserProvider`) had no signal to reconstruct after a network switch.
