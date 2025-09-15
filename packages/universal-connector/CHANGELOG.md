# @reown/appkit-universal-connector

## 1.8.4

### Patch Changes

- [#4979](https://github.com/reown-com/appkit/pull/4979) [`75dfdbd`](https://github.com/reown-com/appkit/commit/75dfdbda65d1a6d491a866015669da39e013a810) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where using the `open` function with send arguments and attempting to switch networks did not throw, causing the network state to become inconsistent

- [#4965](https://github.com/reown-com/appkit/pull/4965) [`120b141`](https://github.com/reown-com/appkit/commit/120b1410986c787af0ae15094b02adfee8621efd) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the wallet icon from the SIWX screen was not properly rendered on Safari

- [`8e051a4`](https://github.com/reown-com/appkit/commit/8e051a431fbc6d2d386ceb3c1d2764991b0aece1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the question mark icon in the header was not displayed correctly

- [#4968](https://github.com/reown-com/appkit/pull/4968) [`504fe04`](https://github.com/reown-com/appkit/commit/504fe04237e8213a39bc7dce42db6175829f38b3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the send input field did not include number pattern validation when typing characters

- [#4962](https://github.com/reown-com/appkit/pull/4962) [`197dcbf`](https://github.com/reown-com/appkit/commit/197dcbf7a0d1ff89e1e820766714cef2acf1eb17) Thanks [@magiziz](https://github.com/magiziz)! - Added send arguments to `open` function to customize the send flow experience by pre-configuring the token, amount, chain, and recipient address

- Updated dependencies [[`75dfdbd`](https://github.com/reown-com/appkit/commit/75dfdbda65d1a6d491a866015669da39e013a810), [`120b141`](https://github.com/reown-com/appkit/commit/120b1410986c787af0ae15094b02adfee8621efd), [`8e051a4`](https://github.com/reown-com/appkit/commit/8e051a431fbc6d2d386ceb3c1d2764991b0aece1), [`504fe04`](https://github.com/reown-com/appkit/commit/504fe04237e8213a39bc7dce42db6175829f38b3), [`197dcbf`](https://github.com/reown-com/appkit/commit/197dcbf7a0d1ff89e1e820766714cef2acf1eb17)]:
  - @reown/appkit@1.8.4
  - @reown/appkit-common@1.8.4

## 1.8.3

### Patch Changes

- [#4872](https://github.com/reown-com/appkit/pull/4872) [`8ba484f`](https://github.com/reown-com/appkit/commit/8ba484fa97d2da0ca721b05407a4cc439437e16f) Thanks [@zoruka](https://github.com/zoruka)! - Fix filtering of wallets on ApiController to allow webapp wallets in mobile.

- [#4950](https://github.com/reown-com/appkit/pull/4950) [`756a3ee`](https://github.com/reown-com/appkit/commit/756a3eefe6cb075db1582df6cc7ca3456403a158) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented batching for pulse api analytics

- [#4941](https://github.com/reown-com/appkit/pull/4941) [`721bfcf`](https://github.com/reown-com/appkit/commit/721bfcf90e5d5e7d425d989f3e9a313373e40747) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where funding from the exchange did not work on the first attempt

- [#4957](https://github.com/reown-com/appkit/pull/4957) [`5595d17`](https://github.com/reown-com/appkit/commit/5595d1785821170e301ea4966994419a4cbb21cc) Thanks [@magiziz](https://github.com/magiziz)! - Replaced "deposit from an exchange" to "deposit from exchange" in appkit header

- [#4934](https://github.com/reown-com/appkit/pull/4934) [`6e465c5`](https://github.com/reown-com/appkit/commit/6e465c5f6aaf10c64bc99968f4d3970ecb77831e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

- Updated dependencies [[`c44d696`](https://github.com/reown-com/appkit/commit/c44d69607496e723c37664a25e306f5563846ece), [`8ba484f`](https://github.com/reown-com/appkit/commit/8ba484fa97d2da0ca721b05407a4cc439437e16f), [`756a3ee`](https://github.com/reown-com/appkit/commit/756a3eefe6cb075db1582df6cc7ca3456403a158), [`382fb6b`](https://github.com/reown-com/appkit/commit/382fb6bae0912dd5f8154ebd3d88ded2b73bda3f), [`7495de9`](https://github.com/reown-com/appkit/commit/7495de95e8eea1b54734a25965b43a9f926f28e7), [`721bfcf`](https://github.com/reown-com/appkit/commit/721bfcf90e5d5e7d425d989f3e9a313373e40747), [`5595d17`](https://github.com/reown-com/appkit/commit/5595d1785821170e301ea4966994419a4cbb21cc), [`99ead12`](https://github.com/reown-com/appkit/commit/99ead12c31d8f591d16e798f229fae84dce5faaa), [`6e465c5`](https://github.com/reown-com/appkit/commit/6e465c5f6aaf10c64bc99968f4d3970ecb77831e), [`df63af5`](https://github.com/reown-com/appkit/commit/df63af568507892398a55bc7eb31e37606dac3da)]:
  - @reown/appkit@1.8.3
  - @reown/appkit-common@1.8.3

## 1.8.2

### Patch Changes

- [#4923](https://github.com/reown-com/appkit/pull/4923) [`b6adfdc`](https://github.com/reown-com/appkit/commit/b6adfdc1713daefb63393d9fa3a2cb2e31ba00e2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

- Updated dependencies [[`d412fdb`](https://github.com/reown-com/appkit/commit/d412fdbe4a10583844fc19fa5dae364a7e92a9ca), [`b6adfdc`](https://github.com/reown-com/appkit/commit/b6adfdc1713daefb63393d9fa3a2cb2e31ba00e2)]:
  - @reown/appkit@1.8.2
  - @reown/appkit-common@1.8.2

## 1.8.1

### Patch Changes

- [#4891](https://github.com/reown-com/appkit/pull/4891) [`01283a8`](https://github.com/reown-com/appkit/commit/01283a82083a25108665f1d8e5c02194ed5e57e3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin signet network

- [#4892](https://github.com/reown-com/appkit/pull/4892) [`58a66f1`](https://github.com/reown-com/appkit/commit/58a66f1687c8ad7a84ab7aeac9a36a9b2314c885) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `authConnector` was always included in wagmi config when email and social login were disabled

- Updated dependencies [[`01283a8`](https://github.com/reown-com/appkit/commit/01283a82083a25108665f1d8e5c02194ed5e57e3), [`58a66f1`](https://github.com/reown-com/appkit/commit/58a66f1687c8ad7a84ab7aeac9a36a9b2314c885)]:
  - @reown/appkit@1.8.1
  - @reown/appkit-common@1.8.1

## 1.8.0

### Patch Changes

- [#4890](https://github.com/reown-com/appkit/pull/4890) [`0840d47`](https://github.com/reown-com/appkit/commit/0840d475e721fba14cd8adc32410c7d9b4804c6e) Thanks [@tomiir](https://github.com/tomiir)! - Adds token selection on fund from exchange flow. Fixes issues related to exchanges not supporting specific tokens.

- [#4841](https://github.com/reown-com/appkit/pull/4841) [`aae952a`](https://github.com/reown-com/appkit/commit/aae952a94468307125f46479d8ec41fe609679bc) Thanks [@magiziz](https://github.com/magiziz)! - Improved "Fund Wallet" flow by adding validation checks from remote config

- [#4877](https://github.com/reown-com/appkit/pull/4877) [`530ccda`](https://github.com/reown-com/appkit/commit/530ccda64543ebc32906b0dfc708d8ede96a08ba) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users could not send SPL solana tokens through the send flow

- [#4886](https://github.com/reown-com/appkit/pull/4886) [`362c203`](https://github.com/reown-com/appkit/commit/362c20314c788245a05f087bbbf19a84da24a897) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where bitcoin walletconnect signing requests did not include the correct user address

- [#4867](https://github.com/reown-com/appkit/pull/4867) [`104528d`](https://github.com/reown-com/appkit/commit/104528d53b7066ec52b8dba5cd6edbfce0385957) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented clean up of open rpc requests send to embedded wallet when the request is responded to.

- Updated dependencies [[`0840d47`](https://github.com/reown-com/appkit/commit/0840d475e721fba14cd8adc32410c7d9b4804c6e), [`aae952a`](https://github.com/reown-com/appkit/commit/aae952a94468307125f46479d8ec41fe609679bc), [`530ccda`](https://github.com/reown-com/appkit/commit/530ccda64543ebc32906b0dfc708d8ede96a08ba), [`362c203`](https://github.com/reown-com/appkit/commit/362c20314c788245a05f087bbbf19a84da24a897), [`104528d`](https://github.com/reown-com/appkit/commit/104528d53b7066ec52b8dba5cd6edbfce0385957)]:
  - @reown/appkit@1.8.0
  - @reown/appkit-common@1.8.0

## 1.7.20

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

- Updated dependencies [[`bd813fb`](https://github.com/reown-com/appkit/commit/bd813fb4e827a43ecdacbf4b3cf7dc8ce84754b2), [`e040633`](https://github.com/reown-com/appkit/commit/e0406337b25b68dd8a774de099324c8edabc140f), [`a3ea12d`](https://github.com/reown-com/appkit/commit/a3ea12de7640f6a40967964b8080a15c72a8e03b), [`0f32a68`](https://github.com/reown-com/appkit/commit/0f32a682ac4daa704bf39c932c38f92ee97e2318), [`ce475a4`](https://github.com/reown-com/appkit/commit/ce475a43d29752a4cb6370caa2c07815456aa38d), [`dd8479d`](https://github.com/reown-com/appkit/commit/dd8479d6ed902a96aa9de0bbd7a64f64139a3a0c), [`c8f202b`](https://github.com/reown-com/appkit/commit/c8f202bcba777f3fc38aff6618ef4bd0e19fce2b), [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e), [`fe60caa`](https://github.com/reown-com/appkit/commit/fe60caa73f218c85521ace9825f593a2862f96c4), [`d4eeff9`](https://github.com/reown-com/appkit/commit/d4eeff99b649cea9c9bfe6cb8bc590e40c2978bf), [`5274c54`](https://github.com/reown-com/appkit/commit/5274c54ac5fd5d18dc553333ad0f69305944221c), [`a3ea12d`](https://github.com/reown-com/appkit/commit/a3ea12de7640f6a40967964b8080a15c72a8e03b), [`b0fe149`](https://github.com/reown-com/appkit/commit/b0fe1499bc24b31d0be8188f907b5daf42a9b10f), [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e), [`cd762e8`](https://github.com/reown-com/appkit/commit/cd762e8f8c8100d31df1578372def3ce02d31919)]:
  - @reown/appkit@1.7.20
  - @reown/appkit-common@1.7.20

## 1.7.19

### Patch Changes

- [#4747](https://github.com/reown-com/appkit/pull/4747) [`cbe17ff`](https://github.com/reown-com/appkit/commit/cbe17ffc0a4a7d8aa8ba9471f02d09f005629d0a) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Removed custom logic from EVM adapters that gets `capabilities` from `sessionProperties` as this resposibility should be delegated to the providers

- [#4792](https://github.com/reown-com/appkit/pull/4792) [`2bccf2a`](https://github.com/reown-com/appkit/commit/2bccf2a36cbef80f53453228515cc3407ff8f96e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where secure site screens would break in demo

- Updated dependencies [[`cbe17ff`](https://github.com/reown-com/appkit/commit/cbe17ffc0a4a7d8aa8ba9471f02d09f005629d0a), [`2bccf2a`](https://github.com/reown-com/appkit/commit/2bccf2a36cbef80f53453228515cc3407ff8f96e)]:
  - @reown/appkit@1.7.19
  - @reown/appkit-common@1.7.19

## 1.7.18

### Patch Changes

- [#4737](https://github.com/reown-com/appkit/pull/4737) [`f397324`](https://github.com/reown-com/appkit/commit/f3973243b1036b1a51b00331f52983e304c1f1a5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `allAccounts` didn't include the `publicKey` value

- [#4744](https://github.com/reown-com/appkit/pull/4744) [`673829b`](https://github.com/reown-com/appkit/commit/673829bfeff9934ab2233d5a14fcf6e45a9fd52b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where WalletConnect connections didn't include the `address` value when sending the `CONNECT_SUCCESS` event

- [#4717](https://github.com/reown-com/appkit/pull/4717) [`46c064d`](https://github.com/reown-com/appkit/commit/46c064d5f66e5d75754096507c77f31d083479d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where cancelling a SIWX message on mobile would reset the network state and log the user out

- [#4748](https://github.com/reown-com/appkit/pull/4748) [`9ae13b1`](https://github.com/reown-com/appkit/commit/9ae13b155dea440dddcbb3d8dd52e5fda84d8435) Thanks [@magiziz](https://github.com/magiziz)! - Added support for opening Binance Web3 Wallet via deeplink for Bitcoin

- Updated dependencies [[`f397324`](https://github.com/reown-com/appkit/commit/f3973243b1036b1a51b00331f52983e304c1f1a5), [`673829b`](https://github.com/reown-com/appkit/commit/673829bfeff9934ab2233d5a14fcf6e45a9fd52b), [`46c064d`](https://github.com/reown-com/appkit/commit/46c064d5f66e5d75754096507c77f31d083479d5), [`9ae13b1`](https://github.com/reown-com/appkit/commit/9ae13b155dea440dddcbb3d8dd52e5fda84d8435), [`6d4363a`](https://github.com/reown-com/appkit/commit/6d4363a33a82562addc98f8f6abbd231095fbc8f), [`f948216`](https://github.com/reown-com/appkit/commit/f9482168cc64f6cdc4a2d9e7b491c38c68630c76)]:
  - @reown/appkit@1.7.18
  - @reown/appkit-common@1.7.18

## 1.7.17

### Patch Changes

- [#4704](https://github.com/reown-com/appkit/pull/4704) [`5391a12`](https://github.com/reown-com/appkit/commit/5391a12d952d561ad509ef7ffcdea280a31c0cb5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the update email view would not open when using the `useAppKitUpdateEmail` hook

- [#4703](https://github.com/reown-com/appkit/pull/4703) [`3ad29e2`](https://github.com/reown-com/appkit/commit/3ad29e24faf67c35991bdf191d4497039a7749f6) Thanks [@tomiir](https://github.com/tomiir)! - Adds react export with UniversalConnectorProvider

- [#4708](https://github.com/reown-com/appkit/pull/4708) [`a5410b9`](https://github.com/reown-com/appkit/commit/a5410b94f4ec63cb901b3841c3fc0fdb67a08db6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the modal would close automatically after disconnecting a wallet from the profile view

- [#4709](https://github.com/reown-com/appkit/pull/4709) [`7d41aa6`](https://github.com/reown-com/appkit/commit/7d41aa6a9e647150c08caa65995339effbc5497d) Thanks [@zoruka](https://github.com/zoruka)! - Fix email capture flow for embedded wallet that was skiping due to one click auth

- Updated dependencies [[`a457e61`](https://github.com/reown-com/appkit/commit/a457e61611a04fc19da8e09ece7fe7a11f04a2f4), [`2863286`](https://github.com/reown-com/appkit/commit/286328604c7d0a7dc16b5a23766831cf551f6dca), [`974c73f`](https://github.com/reown-com/appkit/commit/974c73f5532a1313bc89880997873169d70f7588), [`f9e9842`](https://github.com/reown-com/appkit/commit/f9e98423ea3e2798e5d743af2c5cda45376a5ba9), [`5391a12`](https://github.com/reown-com/appkit/commit/5391a12d952d561ad509ef7ffcdea280a31c0cb5), [`43e56fc`](https://github.com/reown-com/appkit/commit/43e56fcfe68005d963447f126277f422eb9bb3e1), [`fde2340`](https://github.com/reown-com/appkit/commit/fde23403503105798f728c7c3ec86e2fb3925194), [`e845518`](https://github.com/reown-com/appkit/commit/e845518e84a88d2b05d4e8a0af98787684ef0711), [`2a953de`](https://github.com/reown-com/appkit/commit/2a953deda4f6ad3333a45b1b0d074c5d8b8c8c65), [`a5410b9`](https://github.com/reown-com/appkit/commit/a5410b94f4ec63cb901b3841c3fc0fdb67a08db6), [`7d41aa6`](https://github.com/reown-com/appkit/commit/7d41aa6a9e647150c08caa65995339effbc5497d)]:
  - @reown/appkit@1.7.17
  - @reown/appkit-common@1.7.17
