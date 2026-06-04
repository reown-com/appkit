---
'@reown/appkit-adapter-tron': patch
---

Implement message signing in the TRON adapter. `TronAdapter.signMessage` previously returned an empty signature, which broke SIWX / Reown Authentication (the empty signature was rejected by the server). It now delegates to the active connector's `signMessage`, producing a real signature.
