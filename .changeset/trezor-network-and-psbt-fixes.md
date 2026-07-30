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

Fixed Bitcoin WalletConnect connector to properly return all HD wallet data from `getAccountAddresses()`. Previously, the method was dropping `publicKey`, `path`, and `purpose` fields from the response, returning only the address. This fix ensures Ledger and Trezor users get complete account information including all derived addresses, public keys, and derivation paths needed for building PSBTs correctly.

Fixed the Trezor Bitcoin connector so it derives keys for the active network and describes transactions to the device correctly.

- **Active network is now respected.** `TrezorConnector` was constructed without the active CAIP network id, so `currentNetwork` stayed `'Bitcoin'` until `switchNetwork()` was called. A testnet-only dapp received mainnet addresses (`m/84'/0'/…`, `coin: 'btc'`) while reporting a matching chain id, and a funded wallet would have been prompted to sign a **mainnet** transaction. `getWallet()` now accepts `requestedCaipNetworkId` — as `OKXConnector` already did — and an unrecognised bip122 network raises an error instead of silently falling back to mainnet.
- **OP_RETURN outputs are described properly.** They were emitted as `{ address: '', script_type: 'PAYTOWITNESS' }`, which made any transaction carrying one unsignable. They are now `PAYTOOPRETURN` with `op_return_data`. Undecodable scripts raise an error rather than being sent as an empty address.
- **Third-party outputs use `PAYTOADDRESS`.** Every output was forced to `PAYTOWITNESS`, which pairs with `address_n` and misdescribes P2SH/P2PKH recipients. Change outputs still use `PAYTOWITNESS` with a derivation path.
- **`signPSBT` returns `partialSig` instead of a pre-finalized PSBT.** Only `finalScriptWitness` was written and no partial signature, so callers could not finalize the result (`Can not finalize input #0`). This matches every other `BitcoinConnector`.
- **Input amounts and script types are derived from the PSBT.** The amount came from `witnessUtxo` and silently defaulted to `'0'`, which made the device display a wrong fee; it now also reads `nonWitnessUtxo` and raises an error when neither is present. `script_type` is inferred rather than hardcoded to `SPENDWITNESS`, and derivation paths fall back to the PSBT's `bip32Derivation` before the account default.
- **`@trezor/connect-web` is imported interop-safely.** The default import resolved to `module.exports` under Node's ESM/CJS interop and esbuild's node-mode — which Vite uses when prebundling the adapter as a dependency — so `TrezorConnect.init` was `undefined` and connecting failed with a `TypeError`. Because the adapter's `connect()` wraps every failure as `UserRejectedRequestError`, this surfaced to users as "User rejected the request".

Also adds `signPSBT` test coverage for the connector, which previously had none.
