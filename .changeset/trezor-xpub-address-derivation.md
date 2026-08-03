---
'@reown/appkit-adapter-bitcoin': patch
'pay-test-exchange': patch
'@reown/appkit-adapter-ethers': patch
'@reown/appkit-adapter-ethers5': patch
'@reown/appkit-adapter-solana': patch
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
'@reown/appkit-ui': patch
'@reown/appkit-universal-connector': patch
'@reown/appkit-wallet': patch
'@reown/appkit-wallet-button': patch
---

The Trezor Bitcoin connector now asks the device for account extended public keys once and derives every address locally, instead of requesting addresses from the device on each call.

- **One device interaction per account.** `getAccountAddresses()` issued a fresh `getAddress` call every time it ran, and it is invoked by `connect()`, by the adapter's `getAccounts()`, and again on `switchNetwork()`. Restoring a session opened two popups. A single bundled `getPublicKey` call now covers all four accounts, and the result is cached until disconnect or a coin-type change. Concurrent callers share one in-flight request rather than racing two popups.
- **Legacy, nested SegWit, native SegWit and taproot accounts are all derived** — `m/44'/c'/0'`, `m/49'/c'/0'`, `m/84'/c'/0'` and `m/86'/c'/0'` — each with 20 receive and 20 change addresses. `getDerivedAddresses()` returns the full set and `getAccountDescriptors()` returns the account descriptors. `getAccountAddresses()` is unchanged and still returns the payment and ordinal pair, so no other connector or consumer is affected.
- **`publicKey` is populated.** It was hardcoded to `undefined`, which left the `signInputs[].publicKey` branch of input-path resolution unable to match anything.
- **Change on the change chain is recognised.** Only two addresses were known, so real BIP84 change at `.../1/*` was described to the device as a payment to a third party. Change is now matched against every derived address, and the output script type follows the address rather than always being `PAYTOWITNESS`, which misdescribed legacy, nested SegWit and taproot change.
- **Unknown addresses fail loudly.** `getPathForAddress` ignored its argument and returned the payment path, so signing an address the connector could not place silently used the key at `.../0/0`. It now throws.
- **Taproot outputs no longer break signing.** Output scripts are decoded with `@trezor/utxo-lib`; `bitcoinjs-lib` throws `No ECC Library provided` for P2TR unless `initEccLib()` has been called, which made any PSBT carrying a taproot output unsignable.

Adds `@trezor/utxo-lib` as a direct dependency. It was already installed as a dependency of `@trezor/connect` at the same version, so this adds no new install weight.
