# @reown/appkit-adapter-tron

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
