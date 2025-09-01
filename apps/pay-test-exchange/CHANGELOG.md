# pay-test-exchange

## 0.1.6

### Patch Changes

- [#4891](https://github.com/reown-com/appkit/pull/4891) [`01283a8`](https://github.com/reown-com/appkit/commit/01283a82083a25108665f1d8e5c02194ed5e57e3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin signet network

- [#4892](https://github.com/reown-com/appkit/pull/4892) [`58a66f1`](https://github.com/reown-com/appkit/commit/58a66f1687c8ad7a84ab7aeac9a36a9b2314c885) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `authConnector` was always included in wagmi config when email and social login were disabled

## 0.1.5

### Patch Changes

- [#4890](https://github.com/reown-com/appkit/pull/4890) [`0840d47`](https://github.com/reown-com/appkit/commit/0840d475e721fba14cd8adc32410c7d9b4804c6e) Thanks [@tomiir](https://github.com/tomiir)! - Adds token selection on fund from exchange flow. Fixes issues related to exchanges not supporting specific tokens.

- [#4841](https://github.com/reown-com/appkit/pull/4841) [`aae952a`](https://github.com/reown-com/appkit/commit/aae952a94468307125f46479d8ec41fe609679bc) Thanks [@magiziz](https://github.com/magiziz)! - Improved "Fund Wallet" flow by adding validation checks from remote config

- [#4877](https://github.com/reown-com/appkit/pull/4877) [`530ccda`](https://github.com/reown-com/appkit/commit/530ccda64543ebc32906b0dfc708d8ede96a08ba) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users could not send SPL solana tokens through the send flow

- [#4886](https://github.com/reown-com/appkit/pull/4886) [`362c203`](https://github.com/reown-com/appkit/commit/362c20314c788245a05f087bbbf19a84da24a897) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where bitcoin walletconnect signing requests did not include the correct user address

- [#4867](https://github.com/reown-com/appkit/pull/4867) [`104528d`](https://github.com/reown-com/appkit/commit/104528d53b7066ec52b8dba5cd6edbfce0385957) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented clean up of open rpc requests send to embedded wallet when the request is responded to.

## 0.1.4

### Patch Changes

- [#4803](https://github.com/reown-com/appkit/pull/4803) [`bd813fb`](https://github.com/reown-com/appkit/commit/bd813fb4e827a43ecdacbf4b3cf7dc8ce84754b2) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the OKX Wallet extension was not detected when using wallet button

- [#4848](https://github.com/reown-com/appkit/pull/4848) [`e040633`](https://github.com/reown-com/appkit/commit/e0406337b25b68dd8a774de099324c8edabc140f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where cancelling SIWX message signing did not restore the previous connected network state when using social or email login

- [#4753](https://github.com/reown-com/appkit/pull/4753) [`0f32a68`](https://github.com/reown-com/appkit/commit/0f32a682ac4daa704bf39c932c38f92ee97e2318) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Moved the `ux by reown` in qr basic view under the `All Wallets` button

- [#4821](https://github.com/reown-com/appkit/pull/4821) [`c8f202b`](https://github.com/reown-com/appkit/commit/c8f202bcba777f3fc38aff6618ef4bd0e19fce2b) Thanks [@magiziz](https://github.com/magiziz)! - Introduced checksum address conversion when connecting to wallets

- [#4787](https://github.com/reown-com/appkit/pull/4787) [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug in the UP handler where it wasn't subscribing to `accountsChanged` events

- [#4806](https://github.com/reown-com/appkit/pull/4806) [`fe60caa`](https://github.com/reown-com/appkit/commit/fe60caa73f218c85521ace9825f593a2862f96c4) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where errors thrown by controllers were not serialized properly

- [#4819](https://github.com/reown-com/appkit/pull/4819) [`d4eeff9`](https://github.com/reown-com/appkit/commit/d4eeff99b649cea9c9bfe6cb8bc590e40c2978bf) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where rejecting a connection request from a mobile wallet would not redirect back to the previous screen to allow re-initiating the connection

- [#4828](https://github.com/reown-com/appkit/pull/4828) [`5274c54`](https://github.com/reown-com/appkit/commit/5274c54ac5fd5d18dc553333ad0f69305944221c) Thanks [@zoruka](https://github.com/zoruka)! - Add better error message when reown authentication is not enabled

- [#4817](https://github.com/reown-com/appkit/pull/4817) [`b0fe149`](https://github.com/reown-com/appkit/commit/b0fe1499bc24b31d0be8188f907b5daf42a9b10f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where using `<w3m-button>` with multichain didn't reflect the latest state changes and fixed send flow issues on solana when using multichain

- [#4787](https://github.com/reown-com/appkit/pull/4787) [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Updated `@walletconnect` deps to `2.21.7`

- [#4750](https://github.com/reown-com/appkit/pull/4750) [`cd762e8`](https://github.com/reown-com/appkit/commit/cd762e8f8c8100d31df1578372def3ce02d31919) Thanks [@zoruka](https://github.com/zoruka)! - Move ReownAuthentication class into @reown/appkit-controllers package and implementing an easy integration through AppKit features and remote features.

## 0.1.3

### Patch Changes

- [#4747](https://github.com/reown-com/appkit/pull/4747) [`cbe17ff`](https://github.com/reown-com/appkit/commit/cbe17ffc0a4a7d8aa8ba9471f02d09f005629d0a) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Removed custom logic from EVM adapters that gets `capabilities` from `sessionProperties` as this resposibility should be delegated to the providers

- [#4792](https://github.com/reown-com/appkit/pull/4792) [`2bccf2a`](https://github.com/reown-com/appkit/commit/2bccf2a36cbef80f53453228515cc3407ff8f96e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where secure site screens would break in demo

## 0.1.2

### Patch Changes

- [#4737](https://github.com/reown-com/appkit/pull/4737) [`f397324`](https://github.com/reown-com/appkit/commit/f3973243b1036b1a51b00331f52983e304c1f1a5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `allAccounts` didn't include the `publicKey` value

- [#4744](https://github.com/reown-com/appkit/pull/4744) [`673829b`](https://github.com/reown-com/appkit/commit/673829bfeff9934ab2233d5a14fcf6e45a9fd52b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where WalletConnect connections didn't include the `address` value when sending the `CONNECT_SUCCESS` event

- [#4717](https://github.com/reown-com/appkit/pull/4717) [`46c064d`](https://github.com/reown-com/appkit/commit/46c064d5f66e5d75754096507c77f31d083479d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where cancelling a SIWX message on mobile would reset the network state and log the user out

- [#4748](https://github.com/reown-com/appkit/pull/4748) [`9ae13b1`](https://github.com/reown-com/appkit/commit/9ae13b155dea440dddcbb3d8dd52e5fda84d8435) Thanks [@magiziz](https://github.com/magiziz)! - Added support for opening Binance Web3 Wallet via deeplink for Bitcoin

## 0.1.1

### Patch Changes

- [#4709](https://github.com/reown-com/appkit/pull/4709) [`7d41aa6`](https://github.com/reown-com/appkit/commit/7d41aa6a9e647150c08caa65995339effbc5497d) Thanks [@zoruka](https://github.com/zoruka)! - Fix email capture flow for embedded wallet that was skiping due to one click auth
