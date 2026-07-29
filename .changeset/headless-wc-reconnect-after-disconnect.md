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

Fix headless hosts getting stuck after a disconnect, where connecting any wallet afterwards silently did nothing and every attempt reported a connection error until the page was reloaded.

Two gaps, both only reachable without scaffold-ui (which re-fetches the URI per view and clears the error on "try again"):

- `wcError` was only ever cleared by a successful mobile deeplink or the headful "try again" button, so a single failure left every later attempt reading as failed. A new `connectWalletConnect` attempt now starts from a clean error state.
- `ConnectionControllerUtil.onConnectMobile` is a no-op without a pairing URI, and a disconnect clears it (`resetWcConnection`). `connectWallet` / the `useAppKitWallets` `connect` now reject in that case (`ConnectionControllerUtil.assertWcUriForDeeplink`) instead of resolving as if a wallet had been opened, so the host can pre-fetch a URI and retry rather than waiting on a redirect that never fires.

Headless hosts can also now read the pairing expiry: `getWalletConnectUri()` returns `wcPairingExpiry` alongside `wcUri` / `wcError` / `wcFetchingUri`, and `subscribeWalletConnectUri` fires on it. `ConnectionController.setUri` has always stamped it four minutes out, and scaffold-ui reads it (`isPairingExpired`) to decide whether to re-connect — it simply was never passed through to the headless read.

It matters for a host that consumes the URI later than it fetched it. Scaffold-ui generates a URI and acts on it in one gesture, so a lapsed pairing is nearly unreachable there. A host whose picker fetches on wallet select and deeplinks on a second, user-paced click can easily be past four minutes by the time the user taps, and no other field in the snapshot distinguishes a fresh URI from a dead one.

