# @reown/appkit-adapter-stellar

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

- [#5768](https://github.com/reown-com/appkit/pull/5768) [`cd395ad`](https://github.com/reown-com/appkit/commit/cd395addb82bf148a8b3739f8ab17a53f65b6e2d) Thanks [@0xmkh](https://github.com/0xmkh)! - Upgraded viem to latest version

- [#5755](https://github.com/reown-com/appkit/pull/5755) [`3d181c8`](https://github.com/reown-com/appkit/commit/3d181c841d5c3708f5b874e0722092707546e8c6) Thanks [@santgr11](https://github.com/santgr11)! - Make default wallet icon bigget in Sign In message request

- [#5760](https://github.com/reown-com/appkit/pull/5760) [`c2172e1`](https://github.com/reown-com/appkit/commit/c2172e1f24019c592d527f3ad59d04cd1bef87a3) Thanks [@santgr11](https://github.com/santgr11)! - Fixed the SIWX sign-message prompt not appearing after connecting until the page was refreshed, reproducible with the Solana adapter on email sign-in and more generally with Farcaster login or browser-injected-wallet connections.

- [#5756](https://github.com/reown-com/appkit/pull/5756) [`af531f4`](https://github.com/reown-com/appkit/commit/af531f434a77a3c50f8afccbff5224135d63571c) Thanks [@santgr11](https://github.com/santgr11)! - Show the full wallet name in the "Don't have X?" download CTA instead of always hard-truncating it to 12 characters

- [#5758](https://github.com/reown-com/appkit/pull/5758) [`0cec5de`](https://github.com/reown-com/appkit/commit/0cec5dee7d629f4bf602399e2e214b0d3e776ba3) Thanks [@santgr11](https://github.com/santgr11)! - Fix Sign modal Cancel/Sign buttons rendering outside the modal boundary when both show their loading label at once (e.g. after a network hiccup lets a user press both before either resolves). `wui-button` can now shrink as a flex item and truncates its label with an ellipsis instead of overflowing past its own bounds.

- [#5745](https://github.com/reown-com/appkit/pull/5745) [`840dc8f`](https://github.com/reown-com/appkit/commit/840dc8fadc1ac8a18a5f6ce18e935860164382a7) Thanks [@tomiir](https://github.com/tomiir)! - Added Stellar support via WalletConnect through the new `@reown/appkit-adapter-stellar` package. Supports the `stellar:pubnet` and `stellar:testnet` networks and the `stellar_signXDR`, `stellar_signAndSubmitXDR`, `stellar_signMessage` and `stellar_signAuthEntry` methods, along with a SIWX verifier for SEP-53 signatures. Stellar wallets connect over WalletConnect only -- there is no extension wallet support.

- Updated dependencies [[`d6cb98d`](https://github.com/reown-com/appkit/commit/d6cb98d47eccd976ef47b016264708399bb0a175), [`cd395ad`](https://github.com/reown-com/appkit/commit/cd395addb82bf148a8b3739f8ab17a53f65b6e2d), [`3d181c8`](https://github.com/reown-com/appkit/commit/3d181c841d5c3708f5b874e0722092707546e8c6), [`c2172e1`](https://github.com/reown-com/appkit/commit/c2172e1f24019c592d527f3ad59d04cd1bef87a3), [`4d6cf6a`](https://github.com/reown-com/appkit/commit/4d6cf6aeabddce159f04144ef60c7abd31c052c2), [`af531f4`](https://github.com/reown-com/appkit/commit/af531f434a77a3c50f8afccbff5224135d63571c), [`0cec5de`](https://github.com/reown-com/appkit/commit/0cec5dee7d629f4bf602399e2e214b0d3e776ba3), [`d8263cb`](https://github.com/reown-com/appkit/commit/d8263cb6ebb9e1618509f9d9311ea48850b80df1), [`840dc8f`](https://github.com/reown-com/appkit/commit/840dc8fadc1ac8a18a5f6ce18e935860164382a7), [`8fe48b0`](https://github.com/reown-com/appkit/commit/8fe48b04adb2543c5c64b930bf9c6d21a6ca215d), [`b9a2612`](https://github.com/reown-com/appkit/commit/b9a2612c9cd23c7a145a8d25fae86aac32cc5233)]:
  - @reown/appkit@1.8.24
  - @reown/appkit-utils@1.8.24
  - @reown/appkit-common@1.8.24
  - @reown/appkit-controllers@1.8.24
  - @reown/appkit-polyfills@1.8.24
