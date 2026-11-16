# @reown/appkit-adapter-tron

## 2.0.0

### Major Changes

- [#5793](https://github.com/reown-com/appkit/pull/5793) [`8f9f39f`](https://github.com/reown-com/appkit/commit/8f9f39f1dfe0a21bb619dd9a33b6d7500523298b) Thanks [@0xmkh](https://github.com/0xmkh)! - Add wagmi v3 support

### Minor Changes

- [#5796](https://github.com/reown-com/appkit/pull/5796) [`c9c989a`](https://github.com/reown-com/appkit/commit/c9c989a18ec692ae6707a66b2127c6d6042bdbae) Thanks [@santgr11](https://github.com/santgr11)! - Added support for reading a wallet's address and signing/sending transactions using @solana/kit (the newer Solana SDK), alongside the existing @solana/web3.js support.

- [#5798](https://github.com/reown-com/appkit/pull/5798) [`e68c9d8`](https://github.com/reown-com/appkit/commit/e68c9d8c9ad63f2c42e9fcfa95ac961200f9736c) Thanks [@santgr11](https://github.com/santgr11)! - Added support for building and sending SPL token transfers using @solana/kit (the newer Solana SDK), alongside the existing @solana/web3.js-based support.

### Patch Changes

- [#5802](https://github.com/reown-com/appkit/pull/5802) [`09c48db`](https://github.com/reown-com/appkit/commit/09c48db73d2823a505eb4c7546ebecd590c81230) Thanks [@0xmkh](https://github.com/0xmkh)! - Migrate Meld onramp widget URL to server-side minting via blockchain-api

- [#5781](https://github.com/reown-com/appkit/pull/5781) [`a3b3eab`](https://github.com/reown-com/appkit/commit/a3b3eabf6f32b085b2cc7be61308e4861e4af12f) Thanks [@santgr11](https://github.com/santgr11)! - Fixed TRON `sendTransaction` failing on chains outside the Blockchain API's supported list (e.g. Shasta testnet) by falling back to calling the chain's fullnode directly. Also fixed network switching not reaching the underlying wallet adapter for injected TRON connectors.

- [#5819](https://github.com/reown-com/appkit/pull/5819) [`f31d2fb`](https://github.com/reown-com/appkit/commit/f31d2fb18b6120eceeb6319ee967b5ff8f4c8e41) Thanks [@santgr11](https://github.com/santgr11)! - Fixed Bitcoin `signPSBT` over WalletConnect failing with "Invalid params" in wallets such as Xverse when `signInputs` is empty. The adapter now signs the inputs that belong to the connected account, as the injected Bitcoin connectors already do.

- [#5790](https://github.com/reown-com/appkit/pull/5790) [`88a78cf`](https://github.com/reown-com/appkit/commit/88a78cf57f2ea8cb2c4805c4efeff5ea965be687) Thanks [@santgr11](https://github.com/santgr11)! - Fixed MetaMask silently reconnecting the previously authorized Bitcoin account instead of allowing the user to pick a different one.

- [#5807](https://github.com/reown-com/appkit/pull/5807) [`a82c8d0`](https://github.com/reown-com/appkit/commit/a82c8d06d3b27a41f3c33e0f638168437e3d0cd5) Thanks [@santgr11](https://github.com/santgr11)! - Fixed Tron SIWX failing with Binance Web3 over WalletConnect by prefixing `0x` on message signatures returned without it

- [#5800](https://github.com/reown-com/appkit/pull/5800) [`8b70242`](https://github.com/reown-com/appkit/commit/8b70242d04e07a8ea6da950200d252689b82aed9) Thanks [@santgr11](https://github.com/santgr11)! - Added a solana-kit `Rpc` client to the Solana adapter alongside its existing connection, so apps using `@solana/kit` can read balances, fetch blockhashes, and wait for transaction confirmations through AppKit directly.

- [#5833](https://github.com/reown-com/appkit/pull/5833) [`fa90f4d`](https://github.com/reown-com/appkit/commit/fa90f4de7ebce805316f791b38cda0f06bda9b86) Thanks [@Koobi33](https://github.com/Koobi33)! - Fixed one-click auth (`wc_sessionAuthenticate`) ignoring `universalProviderConfigOverride.methods.eip155`. The WalletConnect connector now passes the overridden EVM methods to `authenticate`, so the ReCap in the SIWE message lists only the methods the dApp asked for. Without an override, the default method list is unchanged.

- [#5786](https://github.com/reown-com/appkit/pull/5786) [`866c940`](https://github.com/reown-com/appkit/commit/866c940f50965904dab4ce3031a78248ddaa7cc5) Thanks [@santgr11](https://github.com/santgr11)! - Fix undersized smart-account badge icon on wallet items

- [#5812](https://github.com/reown-com/appkit/pull/5812) [`ada9b58`](https://github.com/reown-com/appkit/commit/ada9b580a62719e9ef922b4eb19390fa4fa2c54e) Thanks [@santgr11](https://github.com/santgr11)! - Fixed sign-in failing with Phantom on Solana, for Reown Authentication and for the default SIWX. The Solana sign-in message now includes a statement and writes the chain as `solana:mainnet`, `solana:testnet` or `solana:devnet`, which Phantom requires before it shows the signature request. Apps that check the default SIWX message text on their own backend will see this new format for Solana.

- [#5806](https://github.com/reown-com/appkit/pull/5806) [`28555e3`](https://github.com/reown-com/appkit/commit/28555e3cf6b8c4d0d95b8c47e261dad8162b6aa0) Thanks [@santgr11](https://github.com/santgr11)! - Fixed SPL token sends falling back to a static compute-unit limit (and a higher priority fee)

- [#5820](https://github.com/reown-com/appkit/pull/5820) [`e44c739`](https://github.com/reown-com/appkit/commit/e44c73931cd2e36e33ccd36e9176d2e56834ed7b) Thanks [@santgr11](https://github.com/santgr11)! - Fixed Solana `signAllTransactions` stalling in mobile browsers for wallets that do not support `solana_signAllTransactions`: the per-transaction requests are now all sent up front instead of one at a time after each answer.

- [#5773](https://github.com/reown-com/appkit/pull/5773) [`5c1a615`](https://github.com/reown-com/appkit/commit/5c1a615898ff5af4df0576977232ea3783d0e4cc) Thanks [@santgr11](https://github.com/santgr11)! - Keep sign modal buttons inside the modal boundary

- [#5810](https://github.com/reown-com/appkit/pull/5810) [`bd8d8f9`](https://github.com/reown-com/appkit/commit/bd8d8f9f8ad0dff30c9186bd6084d16bdc43926a) Thanks [@santgr11](https://github.com/santgr11)! - Fixed email and social login wallets failing to send transactions because `eth_chainId` could return a CAIP-2 chain id (for example `eip155:11155111`) instead of a hex chain id. It now always returns a hex chain id for EVM networks.

- [#5791](https://github.com/reown-com/appkit/pull/5791) [`99faa4b`](https://github.com/reown-com/appkit/commit/99faa4bdc3c7b6fbc5bf8f35753d11ef7135418b) Thanks [@santgr11](https://github.com/santgr11)! - Add Stellar logo's image ids

- [#5789](https://github.com/reown-com/appkit/pull/5789) [`83d474b`](https://github.com/reown-com/appkit/commit/83d474b1ba6e1d17ce46dcf50ee8ae6e3f2a653c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes `request()` on the Tron and Stellar WalletConnect connectors, which called a non-existent `internalRequest` and threw `TypeError` for any host calling `provider.request(...)` on a WalletConnect-connected Tron/Stellar wallet. Requests now route through the universal provider on the active chain. Also adds `signTransaction(tx)` to the Tron WalletConnect connector so hosts can sign a prebuilt TronWeb transaction with the spec's `tron_method_version`-aware payload shape.

- [#5799](https://github.com/reown-com/appkit/pull/5799) [`22f8693`](https://github.com/reown-com/appkit/commit/22f86934bafa79e8e74af85e758aa590512bf4bb) Thanks [@santgr11](https://github.com/santgr11)! - Reduced excessive priority fees on SPL token sends by sizing the compute-unit limit from a real transaction simulation instead of a flat static ceiling, falling back to a smaller static limit only if simulation itself fails.

- [#5805](https://github.com/reown-com/appkit/pull/5805) [`6d29482`](https://github.com/reown-com/appkit/commit/6d29482417e8bbbb6036111a118c295b2da2de1e) Thanks [@santgr11](https://github.com/santgr11)! - Fixed signing a solana-kit transaction over WalletConnect failing with `Unexpected legacy-style response` when the wallet returns the spec's `signature` response.

- Updated dependencies [[`09c48db`](https://github.com/reown-com/appkit/commit/09c48db73d2823a505eb4c7546ebecd590c81230), [`a3b3eab`](https://github.com/reown-com/appkit/commit/a3b3eabf6f32b085b2cc7be61308e4861e4af12f), [`c9c989a`](https://github.com/reown-com/appkit/commit/c9c989a18ec692ae6707a66b2127c6d6042bdbae), [`f31d2fb`](https://github.com/reown-com/appkit/commit/f31d2fb18b6120eceeb6319ee967b5ff8f4c8e41), [`88a78cf`](https://github.com/reown-com/appkit/commit/88a78cf57f2ea8cb2c4805c4efeff5ea965be687), [`a82c8d0`](https://github.com/reown-com/appkit/commit/a82c8d06d3b27a41f3c33e0f638168437e3d0cd5), [`8b70242`](https://github.com/reown-com/appkit/commit/8b70242d04e07a8ea6da950200d252689b82aed9), [`fa90f4d`](https://github.com/reown-com/appkit/commit/fa90f4de7ebce805316f791b38cda0f06bda9b86), [`866c940`](https://github.com/reown-com/appkit/commit/866c940f50965904dab4ce3031a78248ddaa7cc5), [`ada9b58`](https://github.com/reown-com/appkit/commit/ada9b580a62719e9ef922b4eb19390fa4fa2c54e), [`28555e3`](https://github.com/reown-com/appkit/commit/28555e3cf6b8c4d0d95b8c47e261dad8162b6aa0), [`e44c739`](https://github.com/reown-com/appkit/commit/e44c73931cd2e36e33ccd36e9176d2e56834ed7b), [`e68c9d8`](https://github.com/reown-com/appkit/commit/e68c9d8c9ad63f2c42e9fcfa95ac961200f9736c), [`5c1a615`](https://github.com/reown-com/appkit/commit/5c1a615898ff5af4df0576977232ea3783d0e4cc), [`bd8d8f9`](https://github.com/reown-com/appkit/commit/bd8d8f9f8ad0dff30c9186bd6084d16bdc43926a), [`99faa4b`](https://github.com/reown-com/appkit/commit/99faa4bdc3c7b6fbc5bf8f35753d11ef7135418b), [`9cdc26c`](https://github.com/reown-com/appkit/commit/9cdc26cf4502eed99e1a0abc801b7507ef9191d5), [`83d474b`](https://github.com/reown-com/appkit/commit/83d474b1ba6e1d17ce46dcf50ee8ae6e3f2a653c), [`22f8693`](https://github.com/reown-com/appkit/commit/22f86934bafa79e8e74af85e758aa590512bf4bb), [`6d29482`](https://github.com/reown-com/appkit/commit/6d29482417e8bbbb6036111a118c295b2da2de1e), [`8f9f39f`](https://github.com/reown-com/appkit/commit/8f9f39f1dfe0a21bb619dd9a33b6d7500523298b)]:
  - @reown/appkit-controllers@2.0.0
  - @reown/appkit@2.0.0
  - @reown/appkit-utils@2.0.0
  - @reown/appkit-common@2.0.0
  - @reown/appkit-polyfills@2.0.0

## 1.8.24

### Patch Changes

- [#5747](https://github.com/reown-com/appkit/pull/5747) [`d6cb98d`](https://github.com/reown-com/appkit/commit/d6cb98d47eccd976ef47b016264708399bb0a175) Thanks [@santgr11](https://github.com/santgr11)! - Fix broken image in tokens with broken image url

- [#5768](https://github.com/reown-com/appkit/pull/5768) [`cd395ad`](https://github.com/reown-com/appkit/commit/cd395addb82bf148a8b3739f8ab17a53f65b6e2d) Thanks [@0xmkh](https://github.com/0xmkh)! - Upgraded viem to latest version

- [#5755](https://github.com/reown-com/appkit/pull/5755) [`3d181c8`](https://github.com/reown-com/appkit/commit/3d181c841d5c3708f5b874e0722092707546e8c6) Thanks [@santgr11](https://github.com/santgr11)! - Make default wallet icon bigget in Sign In message request

- [#5760](https://github.com/reown-com/appkit/pull/5760) [`c2172e1`](https://github.com/reown-com/appkit/commit/c2172e1f24019c592d527f3ad59d04cd1bef87a3) Thanks [@santgr11](https://github.com/santgr11)! - Fixed the SIWX sign-message prompt not appearing after connecting until the page was refreshed, reproducible with the Solana adapter on email sign-in and more generally with Farcaster login or browser-injected-wallet connections.

- [#5728](https://github.com/reown-com/appkit/pull/5728) [`4d6cf6a`](https://github.com/reown-com/appkit/commit/4d6cf6aeabddce159f04144ef60c7abd31c052c2) Thanks [@enesozturk](https://github.com/enesozturk)! - Fix headless hosts getting stuck after a disconnect, where connecting any wallet afterwards silently did nothing and every attempt reported a connection error until the page was reloaded.

  Two gaps, both only reachable without scaffold-ui (which re-fetches the URI per view and clears the error on "try again"):

  - `wcError` was only ever cleared by a successful mobile deeplink or the headful "try again" button, so a single failure left every later attempt reading as failed. A new `connectWalletConnect` attempt now starts from a clean error state.
  - `ConnectionControllerUtil.onConnectMobile` is a no-op without a pairing URI, and a disconnect clears it (`resetWcConnection`). `connectWallet` / the `useAppKitWallets` `connect` now reject in that case (`ConnectionControllerUtil.assertWcUriForDeeplink`) instead of resolving as if a wallet had been opened, so the host can pre-fetch a URI and retry rather than waiting on a redirect that never fires.

  Headless hosts can also now read the pairing expiry: `getWalletConnectUri()` returns `wcPairingExpiry` alongside `wcUri` / `wcError` / `wcFetchingUri`, and `subscribeWalletConnectUri` fires on it. `ConnectionController.setUri` has always stamped it four minutes out, and scaffold-ui reads it (`isPairingExpired`) to decide whether to re-connect — it simply was never passed through to the headless read.

  It matters for a host that consumes the URI later than it fetched it. Scaffold-ui generates a URI and acts on it in one gesture, so a lapsed pairing is nearly unreachable there. A host whose picker fetches on wallet select and deeplinks on a second, user-paced click can easily be past four minutes by the time the user taps, and no other field in the snapshot distinguishes a fresh URI from a dead one.

- [#5756](https://github.com/reown-com/appkit/pull/5756) [`af531f4`](https://github.com/reown-com/appkit/commit/af531f434a77a3c50f8afccbff5224135d63571c) Thanks [@santgr11](https://github.com/santgr11)! - Show the full wallet name in the "Don't have X?" download CTA instead of always hard-truncating it to 12 characters

- [#5758](https://github.com/reown-com/appkit/pull/5758) [`0cec5de`](https://github.com/reown-com/appkit/commit/0cec5dee7d629f4bf602399e2e214b0d3e776ba3) Thanks [@santgr11](https://github.com/santgr11)! - Fix Sign modal Cancel/Sign buttons rendering outside the modal boundary when both show their loading label at once (e.g. after a network hiccup lets a user press both before either resolves). `wui-button` can now shrink as a flex item and truncates its label with an ellipsis instead of overflowing past its own bounds.

- [#5746](https://github.com/reown-com/appkit/pull/5746) [`d8263cb`](https://github.com/reown-com/appkit/commit/d8263cb6ebb9e1618509f9d9311ea48850b80df1) Thanks [@santgr11](https://github.com/santgr11)! - Fix stored TRON wallet connections being silently wiped on reload when a wallet adapter (e.g. TronLink) is still resolving its `readyState` when boot sync runs. `TronAdapter.syncConnectors` now waits for a pending wallet adapter to settle before boot connection sync runs, but only when that adapter has an actual stored TRON connection to restore, so `useAppKitAccount` rehydrates correctly instead of staying disconnected, without adding a delay to every page load.

- [#5745](https://github.com/reown-com/appkit/pull/5745) [`840dc8f`](https://github.com/reown-com/appkit/commit/840dc8fadc1ac8a18a5f6ce18e935860164382a7) Thanks [@tomiir](https://github.com/tomiir)! - Added Stellar support via WalletConnect through the new `@reown/appkit-adapter-stellar` package. Supports the `stellar:pubnet` and `stellar:testnet` networks and the `stellar_signXDR`, `stellar_signAndSubmitXDR`, `stellar_signMessage` and `stellar_signAuthEntry` methods, along with a SIWX verifier for SEP-53 signatures. Stellar wallets connect over WalletConnect only -- there is no extension wallet support.

- [#5736](https://github.com/reown-com/appkit/pull/5736) [`8fe48b0`](https://github.com/reown-com/appkit/commit/8fe48b04adb2543c5c64b930bf9c6d21a6ca215d) Thanks [@0xmkh](https://github.com/0xmkh)! - fix(siwx): resolve multichain wallet signing race condition

  Fixed an issue where SIWX signing would fail with multichain wallets (Trust Wallet, SafePal) when the active namespace changed between message creation and signing.

- [#5723](https://github.com/reown-com/appkit/pull/5723) [`b9a2612`](https://github.com/reown-com/appkit/commit/b9a2612c9cd23c7a145a8d25fae86aac32cc5233) Thanks [@santgr11](https://github.com/santgr11)! - Fixed Rootstock network logo not being displayed in the network selectors.

- Updated dependencies [[`d6cb98d`](https://github.com/reown-com/appkit/commit/d6cb98d47eccd976ef47b016264708399bb0a175), [`cd395ad`](https://github.com/reown-com/appkit/commit/cd395addb82bf148a8b3739f8ab17a53f65b6e2d), [`3d181c8`](https://github.com/reown-com/appkit/commit/3d181c841d5c3708f5b874e0722092707546e8c6), [`c2172e1`](https://github.com/reown-com/appkit/commit/c2172e1f24019c592d527f3ad59d04cd1bef87a3), [`4d6cf6a`](https://github.com/reown-com/appkit/commit/4d6cf6aeabddce159f04144ef60c7abd31c052c2), [`af531f4`](https://github.com/reown-com/appkit/commit/af531f434a77a3c50f8afccbff5224135d63571c), [`0cec5de`](https://github.com/reown-com/appkit/commit/0cec5dee7d629f4bf602399e2e214b0d3e776ba3), [`d8263cb`](https://github.com/reown-com/appkit/commit/d8263cb6ebb9e1618509f9d9311ea48850b80df1), [`840dc8f`](https://github.com/reown-com/appkit/commit/840dc8fadc1ac8a18a5f6ce18e935860164382a7), [`8fe48b0`](https://github.com/reown-com/appkit/commit/8fe48b04adb2543c5c64b930bf9c6d21a6ca215d), [`b9a2612`](https://github.com/reown-com/appkit/commit/b9a2612c9cd23c7a145a8d25fae86aac32cc5233)]:
  - @reown/appkit@1.8.24
  - @reown/appkit-utils@1.8.24
  - @reown/appkit-common@1.8.24
  - @reown/appkit-controllers@1.8.24
  - @reown/appkit-polyfills@1.8.24

## 1.8.23

### Patch Changes

- [#5712](https://github.com/reown-com/appkit/pull/5712) [`f2d2539`](https://github.com/reown-com/appkit/commit/f2d25397347b2347dae13b9088989a6333e813d8) Thanks [@enesozturk](https://github.com/enesozturk)! - Recover Coinbase Wallet from the EIP-1193 `4100` ("Must call 'eth_requestAccounts' before other methods") error that could dead-end signing after a session restore.

  On an AppKit auto-restore, the Coinbase Wallet SDK provider keeps its accounts but drops its internal authorization — unlike wagmi's own `reconnect`, AppKit's restore reads `eth_accounts` without re-issuing `eth_requestAccounts`. Consumers that call `.request()` directly on the provider (rather than through wagmi's hooks) then failed the first signing RPC with `4100`.

  The provider registration seam (`syncProvider`) now wraps Coinbase eip155 providers — keyed on the connector `id`, which is stable across the wagmi, ethers, and ethers5 adapters (the provider "type" is remapped to `'EXTERNAL'` on most paths, so it can't be used to detect Coinbase). A `4100` then triggers a one-shot recovery: a single `eth_requestAccounts` re-authorization, an active-chain re-assert before an `eth_sendTransaction` retry (so the transaction can't broadcast on the wrong network after the handshake resets the SDK's chain), then exactly one retry. Non-`4100` errors, rejected re-auth prompts, and non-Coinbase providers are unaffected. The wrapper is cached per provider instance so consumers keep a stable reference.

- [#5665](https://github.com/reown-com/appkit/pull/5665) [`e5ee43c`](https://github.com/reown-com/appkit/commit/e5ee43c7c4db6f2918d20f588b39f71f10ed2de8) Thanks [@Khizr97](https://github.com/Khizr97)! - Fix `coinbasePreference` option being ignored — `'all'` and `'eoaOnly'` now correctly use the `coinbaseWallet` connector (with QR code support) instead of always using `baseAccount`. `'smartWalletOnly'` uses `baseAccount`. Regression introduced in PR #5269.

- [#5663](https://github.com/reown-com/appkit/pull/5663) [`da65c78`](https://github.com/reown-com/appkit/commit/da65c78e73f4ff3873150b3da6a9b303580217ee) Thanks [@Khizr97](https://github.com/Khizr97)! - fix(ethers,ethers5): resolve walletProvider after account switch in modal

  `useAppKitProvider` returned a stale provider when switching accounts inside the
  modal. In the early-return path of `connect()`, `connector.provider` was never
  initialised, causing the base-client's `accountChanged` handler to skip
  `syncProvider()`. The provider is now resolved from `ethersProviders` before the
  event is emitted.

- [#5706](https://github.com/reown-com/appkit/pull/5706) [`ccf0dcb`](https://github.com/reown-com/appkit/commit/ccf0dcb2d21be5e24458dce45cb1c4d170f04b11) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: persist the universal-link base as the WalletConnect deeplink choice when `experimental_preferUniversalLinks` is enabled, so session-request re-opens (handled by universal-provider) use the wallet's universal link instead of falling back to its native custom scheme

- Updated dependencies [[`f2d2539`](https://github.com/reown-com/appkit/commit/f2d25397347b2347dae13b9088989a6333e813d8), [`e5ee43c`](https://github.com/reown-com/appkit/commit/e5ee43c7c4db6f2918d20f588b39f71f10ed2de8), [`da65c78`](https://github.com/reown-com/appkit/commit/da65c78e73f4ff3873150b3da6a9b303580217ee), [`ccf0dcb`](https://github.com/reown-com/appkit/commit/ccf0dcb2d21be5e24458dce45cb1c4d170f04b11)]:
  - @reown/appkit-utils@1.8.23
  - @reown/appkit@1.8.23
  - @reown/appkit-common@1.8.23
  - @reown/appkit-polyfills@1.8.23
  - @reown/appkit-controllers@1.8.23

## 1.8.22

### Patch Changes

- [#5697](https://github.com/reown-com/appkit/pull/5697) [`6b9c313`](https://github.com/reown-com/appkit/commit/6b9c313ea77bfaddc670ba5bdb0d616179f21728) Thanks [@enesozturk](https://github.com/enesozturk)! - Add a headless read for the WalletConnect URI, so a host can render a QR without the `useAppKitWallets` React hook.

  The AppKit instance now exposes `getWalletConnectUri()` — returning `{ wcUri, wcError, wcFetchingUri }` — and `subscribeWalletConnectUri()`. Both read the connection layer directly (mirroring the existing `getWalletList()` / `subscribeWalletList()` pair), so a headless host gets the URI ungated through the instance without importing `@reown/appkit-controllers` (which can otherwise resolve to a different valtio singleton). This replaces the connection-level `subscribeConnections`, which is gated behind the `multiWallet` remote feature and so can't serve the URI for a single-wallet QR.

  **Breaking:** the imperative pre-fetch trigger previously named `getWalletConnectUri()` is renamed to `prefetchWalletConnectUri()`, freeing `getWalletConnectUri()` for the new read.

- [#5701](https://github.com/reown-com/appkit/pull/5701) [`fb09a6d`](https://github.com/reown-com/appkit/commit/fb09a6d9c48a7c9c4ccc4d4d553663920b89365e) Thanks [@enesozturk](https://github.com/enesozturk)! - Add headless reset methods for the WalletConnect URI + connecting-wallet state.

  The AppKit instance now exposes `resetWalletConnectUri()` and `resetConnectingWallet()` — thin passthroughs to `HeadlessWalletUtil.resetWcUri()` / `resetConnectingWallet()`. A headless host that reads the URI via `getWalletConnectUri()` can now clear it (e.g. when a QR is dismissed or a connection is cancelled) through the instance, without importing `@reown/appkit-controllers`. This completes the headless WalletConnect-URI surface alongside `getWalletConnectUri` / `subscribeWalletConnectUri` / `prefetchWalletConnectUri`.

- [#5695](https://github.com/reown-com/appkit/pull/5695) [`a4b2d2f`](https://github.com/reown-com/appkit/commit/a4b2d2ff67f1712a3a19d31755c5de1e3c9b500d) Thanks [@enesozturk](https://github.com/enesozturk)! - Expose the headless wallet list imperatively on the AppKit client, so a non-React host can list / search / connect wallets without the `useAppKitWallets` React hook.

  New `AppKit` instance methods: `fetchWallets(options?)`, `getWalletList()`, `subscribeWalletList(cb)`, `getWalletConnectUri(options?)`, and `connectWallet(wallet, namespace?, options?)`. The shared imperative logic lives in a new `HeadlessWalletUtil` (`@reown/appkit-controllers`), which both the client methods and the React hook can use — one tested code path for headless wallet listing, search, pagination, the WalletConnect URI, and programmatic connect (injected / API / mobile-deeplink).

- [#5694](https://github.com/reown-com/appkit/pull/5694) [`1c17897`](https://github.com/reown-com/appkit/commit/1c17897a19333987aecb392c1e8513b6753f9c11) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixed TRON `tron_signTransaction` payload shape to respect the wallet's `tron_method_version` session property. The connector now sends the spec-mandated legacy nested `transaction.transaction` shape by default, and the simplified flat shape only when the wallet advertises `tron_method_version: "v1"` in `sessionProperties`.

- Updated dependencies [[`6b9c313`](https://github.com/reown-com/appkit/commit/6b9c313ea77bfaddc670ba5bdb0d616179f21728), [`fb09a6d`](https://github.com/reown-com/appkit/commit/fb09a6d9c48a7c9c4ccc4d4d553663920b89365e), [`a4b2d2f`](https://github.com/reown-com/appkit/commit/a4b2d2ff67f1712a3a19d31755c5de1e3c9b500d), [`1c17897`](https://github.com/reown-com/appkit/commit/1c17897a19333987aecb392c1e8513b6753f9c11)]:
  - @reown/appkit-utils@1.8.22
  - @reown/appkit@1.8.22
  - @reown/appkit-common@1.8.22
  - @reown/appkit-polyfills@1.8.22
  - @reown/appkit-controllers@1.8.22

## 1.8.21

### Patch Changes

- [#5685](https://github.com/reown-com/appkit/pull/5685) [`ea99fd1`](https://github.com/reown-com/appkit/commit/ea99fd1293161577216e86c1b5137dd56def4362) Thanks [@enesozturk](https://github.com/enesozturk)! - Add `includePayOnly` and `sort` options to `useAppKitWallets().fetchWallets()`. `includePayOnly` surfaces wallets that support WalletConnect Pay but are not v2-compatible (filtered out by default), and `sort: 'wcpay'` bubbles WalletConnect Pay-supporting wallets to the top.

- Updated dependencies [[`ea99fd1`](https://github.com/reown-com/appkit/commit/ea99fd1293161577216e86c1b5137dd56def4362)]:
  - @reown/appkit-utils@1.8.21
  - @reown/appkit@1.8.21
  - @reown/appkit-common@1.8.21
  - @reown/appkit-polyfills@1.8.21
  - @reown/appkit-controllers@1.8.21

## 1.8.20

### Patch Changes

- Updated dependencies [[`08f5c48`](https://github.com/reown-com/appkit/commit/08f5c48f29d9fb1525e5251b8e1a4a9db4299a0d), [`f913185`](https://github.com/reown-com/appkit/commit/f9131858e77984aa373e243e8733c3adfac8da13), [`ed51ea6`](https://github.com/reown-com/appkit/commit/ed51ea6d67aa412ad397c594cf39a260015bbae9), [`cc75433`](https://github.com/reown-com/appkit/commit/cc75433b628d5682081bed8ae42690c20cf5823f), [`6b7096e`](https://github.com/reown-com/appkit/commit/6b7096e417b8e80d60594edc666ed2ebb5b67563)]:
  - @reown/appkit@1.8.20
  - @reown/appkit-controllers@1.8.20
  - @reown/appkit-utils@1.8.20
  - @reown/appkit-common@1.8.20
  - @reown/appkit-polyfills@1.8.20

## 1.8.19

### Patch Changes

- Updated dependencies [[`a7646ab`](https://github.com/reown-com/appkit/commit/a7646ab7f3aacb62a8ef23e9670cf41a77609730), [`6851c1b`](https://github.com/reown-com/appkit/commit/6851c1ba88c183bfc5b6ca1bf8e0efba26012b78), [`249beb6`](https://github.com/reown-com/appkit/commit/249beb64220596d468c0f91de7b568f5f640b26f)]:
  - @reown/appkit-utils@1.8.19
  - @reown/appkit-controllers@1.8.19
  - @reown/appkit@1.8.19
  - @reown/appkit-common@1.8.19
  - @reown/appkit-polyfills@1.8.19
