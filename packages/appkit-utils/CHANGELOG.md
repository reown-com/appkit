# @reown/appkit-utils

## 1.8.7

### Patch Changes

- [#5043](https://github.com/reown-com/appkit/pull/5043) [`1fe278b`](https://github.com/reown-com/appkit/commit/1fe278b757e08660dffb1fc2fae64ad34be04db4) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `useAppKitConnection` hook returned `null` when wallet is disconnected

- [#5028](https://github.com/reown-com/appkit/pull/5028) [`090dbb5`](https://github.com/reown-com/appkit/commit/090dbb53dce58663f6a025d360156ab38c76f886) Thanks [@magiziz](https://github.com/magiziz)! - Removed NFTs tab from account modal view

- [#5048](https://github.com/reown-com/appkit/pull/5048) [`9b2154c`](https://github.com/reown-com/appkit/commit/9b2154c069c554a45ed0f155bdda096f03d6649c) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `publicKey` was returning `undefined` when connecting with the OKX Bitcoin wallet

- [#5065](https://github.com/reown-com/appkit/pull/5065) [`fde8e5d`](https://github.com/reown-com/appkit/commit/fde8e5d6b0145b1729316ad03d9e9b18fdaf0b97) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix an issue where the wallets would show a small glitch when rendering the connectors

- [#5021](https://github.com/reown-com/appkit/pull/5021) [`05ed5d2`](https://github.com/reown-com/appkit/commit/05ed5d231e53622dde33ecf66e694d85ad411e65) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where a `SEND_ERROR` event was logged when a user rejected a transaction. It now logs a `SEND_REJECTED` event instead

- Updated dependencies [[`1fe278b`](https://github.com/reown-com/appkit/commit/1fe278b757e08660dffb1fc2fae64ad34be04db4), [`0bb4ee5`](https://github.com/reown-com/appkit/commit/0bb4ee5e94b8743b9102327e487d055197cb6040), [`0bb4ee5`](https://github.com/reown-com/appkit/commit/0bb4ee5e94b8743b9102327e487d055197cb6040), [`d7b0555`](https://github.com/reown-com/appkit/commit/d7b05552367a097ef28430ec67aab454fe7e914d), [`090dbb5`](https://github.com/reown-com/appkit/commit/090dbb53dce58663f6a025d360156ab38c76f886), [`d2644de`](https://github.com/reown-com/appkit/commit/d2644de2a58940ed392b826c72defb1f24551462), [`9b2154c`](https://github.com/reown-com/appkit/commit/9b2154c069c554a45ed0f155bdda096f03d6649c), [`fde8e5d`](https://github.com/reown-com/appkit/commit/fde8e5d6b0145b1729316ad03d9e9b18fdaf0b97), [`05ed5d2`](https://github.com/reown-com/appkit/commit/05ed5d231e53622dde33ecf66e694d85ad411e65)]:
  - @reown/appkit-common@1.8.7
  - @reown/appkit-controllers@1.8.7
  - @reown/appkit-polyfills@1.8.7
  - @reown/appkit-wallet@1.8.7

## 1.8.6

### Patch Changes

- [#5030](https://github.com/reown-com/appkit/pull/5030) [`a6779f5`](https://github.com/reown-com/appkit/commit/a6779f5143e1f788450814efcf5beadf8573214a) Thanks [@magiziz](https://github.com/magiziz)! - Added `walletRank` property to the `CONNECT_SUCCESS` event and created a new `@appkit/recent_wallet` local storage key to track the most recently connected wallet

- [#4936](https://github.com/reown-com/appkit/pull/4936) [`0bf1921`](https://github.com/reown-com/appkit/commit/0bf192130f857d395135e5d740328fd1419412bd) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Enhanced connection UX by allowing scanning of QR code with main device camera and prompting the target wallet

- Updated dependencies [[`a6779f5`](https://github.com/reown-com/appkit/commit/a6779f5143e1f788450814efcf5beadf8573214a), [`a3582c2`](https://github.com/reown-com/appkit/commit/a3582c22e5b761d0412bdc51322c070717ae77bb), [`a3582c2`](https://github.com/reown-com/appkit/commit/a3582c22e5b761d0412bdc51322c070717ae77bb), [`0bf1921`](https://github.com/reown-com/appkit/commit/0bf192130f857d395135e5d740328fd1419412bd)]:
  - @reown/appkit-controllers@1.8.6
  - @reown/appkit-common@1.8.6
  - @reown/appkit-polyfills@1.8.6
  - @reown/appkit-wallet@1.8.6

## 1.8.5

### Patch Changes

- [#5002](https://github.com/reown-com/appkit/pull/5002) [`adc15e2`](https://github.com/reown-com/appkit/commit/adc15e28f5224b8d2da5734c978f25597e993123) Thanks [@tomiir](https://github.com/tomiir)! - Updates @coinbase/wallet-sdk to version 4.3.7

- [#4988](https://github.com/reown-com/appkit/pull/4988) [`596c364`](https://github.com/reown-com/appkit/commit/596c3649766975683169e41337e7cd457f57da27) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes SemVer util's extractVersion logic to handle special char fixes on package version

- [#5004](https://github.com/reown-com/appkit/pull/5004) [`21f7512`](https://github.com/reown-com/appkit/commit/21f7512914f525f9a55b718cc7c2f4b08e7e7cfa) Thanks [@magiziz](https://github.com/magiziz)! - Added new functionality that allows users to manually edit the deposit amount on the deposit from exchange screen

- [#4982](https://github.com/reown-com/appkit/pull/4982) [`f58c0b4`](https://github.com/reown-com/appkit/commit/f58c0b4d39883ff2bd04eefc6b3b9eb05a6b7bb6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the question mark icon in the header was not displayed correctly

- [#4992](https://github.com/reown-com/appkit/pull/4992) [`2d27d48`](https://github.com/reown-com/appkit/commit/2d27d480f761e697a14929ba0c687187fd624c3d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where upon user connection rejection a `CONNECT_ERROR` event was logged. It now logs a new event error called `USER_REJECTED`

- Updated dependencies [[`7050573`](https://github.com/reown-com/appkit/commit/70505730b24293f6f5fedee855e1b852828fe689), [`21f7512`](https://github.com/reown-com/appkit/commit/21f7512914f525f9a55b718cc7c2f4b08e7e7cfa), [`13700b8`](https://github.com/reown-com/appkit/commit/13700b8a007245bcee3795fbc984ea4ce9a6a51f), [`f58c0b4`](https://github.com/reown-com/appkit/commit/f58c0b4d39883ff2bd04eefc6b3b9eb05a6b7bb6), [`2d27d48`](https://github.com/reown-com/appkit/commit/2d27d480f761e697a14929ba0c687187fd624c3d)]:
  - @reown/appkit-controllers@1.8.5
  - @reown/appkit-common@1.8.5
  - @reown/appkit-polyfills@1.8.5
  - @reown/appkit-wallet@1.8.5

## 1.8.4

### Patch Changes

- [#4979](https://github.com/reown-com/appkit/pull/4979) [`75dfdbd`](https://github.com/reown-com/appkit/commit/75dfdbda65d1a6d491a866015669da39e013a810) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where using the `open` function with send arguments and attempting to switch networks did not throw, causing the network state to become inconsistent

- [#4965](https://github.com/reown-com/appkit/pull/4965) [`120b141`](https://github.com/reown-com/appkit/commit/120b1410986c787af0ae15094b02adfee8621efd) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the wallet icon from the SIWX screen was not properly rendered on Safari

- [`8e051a4`](https://github.com/reown-com/appkit/commit/8e051a431fbc6d2d386ceb3c1d2764991b0aece1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the question mark icon in the header was not displayed correctly

- [#4968](https://github.com/reown-com/appkit/pull/4968) [`504fe04`](https://github.com/reown-com/appkit/commit/504fe04237e8213a39bc7dce42db6175829f38b3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the send input field did not include number pattern validation when typing characters

- [#4962](https://github.com/reown-com/appkit/pull/4962) [`197dcbf`](https://github.com/reown-com/appkit/commit/197dcbf7a0d1ff89e1e820766714cef2acf1eb17) Thanks [@magiziz](https://github.com/magiziz)! - Added send arguments to `open` function to customize the send flow experience by pre-configuring the token, amount, chain, and recipient address

- Updated dependencies [[`75dfdbd`](https://github.com/reown-com/appkit/commit/75dfdbda65d1a6d491a866015669da39e013a810), [`18ca455`](https://github.com/reown-com/appkit/commit/18ca455e2795ac3f9eb2b91d65d4e729c3b101af), [`120b141`](https://github.com/reown-com/appkit/commit/120b1410986c787af0ae15094b02adfee8621efd), [`8e051a4`](https://github.com/reown-com/appkit/commit/8e051a431fbc6d2d386ceb3c1d2764991b0aece1), [`504fe04`](https://github.com/reown-com/appkit/commit/504fe04237e8213a39bc7dce42db6175829f38b3), [`197dcbf`](https://github.com/reown-com/appkit/commit/197dcbf7a0d1ff89e1e820766714cef2acf1eb17)]:
  - @reown/appkit-controllers@1.8.4
  - @reown/appkit-common@1.8.4
  - @reown/appkit-polyfills@1.8.4
  - @reown/appkit-wallet@1.8.4

## 1.8.3

### Patch Changes

- [#4607](https://github.com/reown-com/appkit/pull/4607) [`c44d696`](https://github.com/reown-com/appkit/commit/c44d69607496e723c37664a25e306f5563846ece) Thanks [@enesozturk](https://github.com/enesozturk)! - Moves `useAppKitProvider` and `ProviderUtil` to `controllers` package, upgrades Valtio versions

- [#4872](https://github.com/reown-com/appkit/pull/4872) [`8ba484f`](https://github.com/reown-com/appkit/commit/8ba484fa97d2da0ca721b05407a4cc439437e16f) Thanks [@zoruka](https://github.com/zoruka)! - Fix filtering of wallets on ApiController to allow webapp wallets in mobile.

- [#4950](https://github.com/reown-com/appkit/pull/4950) [`756a3ee`](https://github.com/reown-com/appkit/commit/756a3eefe6cb075db1582df6cc7ca3456403a158) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented batching for pulse api analytics

- [#4941](https://github.com/reown-com/appkit/pull/4941) [`721bfcf`](https://github.com/reown-com/appkit/commit/721bfcf90e5d5e7d425d989f3e9a313373e40747) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where funding from the exchange did not work on the first attempt

- [#4957](https://github.com/reown-com/appkit/pull/4957) [`5595d17`](https://github.com/reown-com/appkit/commit/5595d1785821170e301ea4966994419a4cbb21cc) Thanks [@magiziz](https://github.com/magiziz)! - Replaced "deposit from an exchange" to "deposit from exchange" in appkit header

- [#4934](https://github.com/reown-com/appkit/pull/4934) [`6e465c5`](https://github.com/reown-com/appkit/commit/6e465c5f6aaf10c64bc99968f4d3970ecb77831e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

- [#4954](https://github.com/reown-com/appkit/pull/4954) [`df63af5`](https://github.com/reown-com/appkit/commit/df63af568507892398a55bc7eb31e37606dac3da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Upgrade Wagmi and Viem versions

- Updated dependencies [[`c44d696`](https://github.com/reown-com/appkit/commit/c44d69607496e723c37664a25e306f5563846ece), [`8ba484f`](https://github.com/reown-com/appkit/commit/8ba484fa97d2da0ca721b05407a4cc439437e16f), [`756a3ee`](https://github.com/reown-com/appkit/commit/756a3eefe6cb075db1582df6cc7ca3456403a158), [`721bfcf`](https://github.com/reown-com/appkit/commit/721bfcf90e5d5e7d425d989f3e9a313373e40747), [`5595d17`](https://github.com/reown-com/appkit/commit/5595d1785821170e301ea4966994419a4cbb21cc), [`6e465c5`](https://github.com/reown-com/appkit/commit/6e465c5f6aaf10c64bc99968f4d3970ecb77831e), [`df63af5`](https://github.com/reown-com/appkit/commit/df63af568507892398a55bc7eb31e37606dac3da)]:
  - @reown/appkit-common@1.8.3
  - @reown/appkit-controllers@1.8.3
  - @reown/appkit-polyfills@1.8.3
  - @reown/appkit-wallet@1.8.3

## 1.8.2

### Patch Changes

- [#4923](https://github.com/reown-com/appkit/pull/4923) [`b6adfdc`](https://github.com/reown-com/appkit/commit/b6adfdc1713daefb63393d9fa3a2cb2e31ba00e2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

- Updated dependencies [[`d412fdb`](https://github.com/reown-com/appkit/commit/d412fdbe4a10583844fc19fa5dae364a7e92a9ca), [`b6adfdc`](https://github.com/reown-com/appkit/commit/b6adfdc1713daefb63393d9fa3a2cb2e31ba00e2)]:
  - @reown/appkit-controllers@1.8.2
  - @reown/appkit-common@1.8.2
  - @reown/appkit-polyfills@1.8.2
  - @reown/appkit-wallet@1.8.2

## 1.8.1

### Patch Changes

- [#4891](https://github.com/reown-com/appkit/pull/4891) [`01283a8`](https://github.com/reown-com/appkit/commit/01283a82083a25108665f1d8e5c02194ed5e57e3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin signet network

- [#4892](https://github.com/reown-com/appkit/pull/4892) [`58a66f1`](https://github.com/reown-com/appkit/commit/58a66f1687c8ad7a84ab7aeac9a36a9b2314c885) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `authConnector` was always included in wagmi config when email and social login were disabled

- Updated dependencies [[`01283a8`](https://github.com/reown-com/appkit/commit/01283a82083a25108665f1d8e5c02194ed5e57e3), [`477eea4`](https://github.com/reown-com/appkit/commit/477eea454add184bc9b5778a0ba46215efee7ede), [`58a66f1`](https://github.com/reown-com/appkit/commit/58a66f1687c8ad7a84ab7aeac9a36a9b2314c885), [`763a4f7`](https://github.com/reown-com/appkit/commit/763a4f7c84c96b9b03258de4f4fcf6764d35c7e8)]:
  - @reown/appkit-common@1.8.1
  - @reown/appkit-controllers@1.8.1
  - @reown/appkit-polyfills@1.8.1
  - @reown/appkit-wallet@1.8.1

## 1.8.0

### Patch Changes

- [#4890](https://github.com/reown-com/appkit/pull/4890) [`0840d47`](https://github.com/reown-com/appkit/commit/0840d475e721fba14cd8adc32410c7d9b4804c6e) Thanks [@tomiir](https://github.com/tomiir)! - Adds token selection on fund from exchange flow. Fixes issues related to exchanges not supporting specific tokens.

- [#4841](https://github.com/reown-com/appkit/pull/4841) [`aae952a`](https://github.com/reown-com/appkit/commit/aae952a94468307125f46479d8ec41fe609679bc) Thanks [@magiziz](https://github.com/magiziz)! - Improved "Fund Wallet" flow by adding validation checks from remote config

- [#4877](https://github.com/reown-com/appkit/pull/4877) [`530ccda`](https://github.com/reown-com/appkit/commit/530ccda64543ebc32906b0dfc708d8ede96a08ba) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users could not send SPL solana tokens through the send flow

- [#4886](https://github.com/reown-com/appkit/pull/4886) [`362c203`](https://github.com/reown-com/appkit/commit/362c20314c788245a05f087bbbf19a84da24a897) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where bitcoin walletconnect signing requests did not include the correct user address

- [#4867](https://github.com/reown-com/appkit/pull/4867) [`104528d`](https://github.com/reown-com/appkit/commit/104528d53b7066ec52b8dba5cd6edbfce0385957) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Implemented clean up of open rpc requests send to embedded wallet when the request is responded to.

- Updated dependencies [[`0840d47`](https://github.com/reown-com/appkit/commit/0840d475e721fba14cd8adc32410c7d9b4804c6e), [`aae952a`](https://github.com/reown-com/appkit/commit/aae952a94468307125f46479d8ec41fe609679bc), [`530ccda`](https://github.com/reown-com/appkit/commit/530ccda64543ebc32906b0dfc708d8ede96a08ba), [`362c203`](https://github.com/reown-com/appkit/commit/362c20314c788245a05f087bbbf19a84da24a897), [`104528d`](https://github.com/reown-com/appkit/commit/104528d53b7066ec52b8dba5cd6edbfce0385957)]:
  - @reown/appkit-common@1.8.0
  - @reown/appkit-controllers@1.8.0
  - @reown/appkit-polyfills@1.8.0
  - @reown/appkit-wallet@1.8.0

## 1.7.20

### Patch Changes

- [#4803](https://github.com/reown-com/appkit/pull/4803) [`bd813fb`](https://github.com/reown-com/appkit/commit/bd813fb4e827a43ecdacbf4b3cf7dc8ce84754b2) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the OKX Wallet extension was not detected when using wallet button

- [#4848](https://github.com/reown-com/appkit/pull/4848) [`e040633`](https://github.com/reown-com/appkit/commit/e0406337b25b68dd8a774de099324c8edabc140f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where cancelling SIWX message signing did not restore the previous connected network state when using social or email login

- [#4753](https://github.com/reown-com/appkit/pull/4753) [`0f32a68`](https://github.com/reown-com/appkit/commit/0f32a682ac4daa704bf39c932c38f92ee97e2318) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Moved the `ux by reown` in qr basic view under the `All Wallets` button

- [#4798](https://github.com/reown-com/appkit/pull/4798) [`ce475a4`](https://github.com/reown-com/appkit/commit/ce475a43d29752a4cb6370caa2c07815456aa38d) Thanks [@tomiir](https://github.com/tomiir)! - Adds deposit from exchange view, allowing users to fund their wallets from a CEX account

- [#4825](https://github.com/reown-com/appkit/pull/4825) [`dd8479d`](https://github.com/reown-com/appkit/commit/dd8479d6ed902a96aa9de0bbd7a64f64139a3a0c) Thanks [@tomiir](https://github.com/tomiir)! - Updates wagmi and viem dependencies to latest versions

- [#4821](https://github.com/reown-com/appkit/pull/4821) [`c8f202b`](https://github.com/reown-com/appkit/commit/c8f202bcba777f3fc38aff6618ef4bd0e19fce2b) Thanks [@magiziz](https://github.com/magiziz)! - Introduced checksum address conversion when connecting to wallets

- [#4787](https://github.com/reown-com/appkit/pull/4787) [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug in the UP handler where it wasn't subscribing to `accountsChanged` events

- [#4806](https://github.com/reown-com/appkit/pull/4806) [`fe60caa`](https://github.com/reown-com/appkit/commit/fe60caa73f218c85521ace9825f593a2862f96c4) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where errors thrown by controllers were not serialized properly

- [#4819](https://github.com/reown-com/appkit/pull/4819) [`d4eeff9`](https://github.com/reown-com/appkit/commit/d4eeff99b649cea9c9bfe6cb8bc590e40c2978bf) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where rejecting a connection request from a mobile wallet would not redirect back to the previous screen to allow re-initiating the connection

- [#4828](https://github.com/reown-com/appkit/pull/4828) [`5274c54`](https://github.com/reown-com/appkit/commit/5274c54ac5fd5d18dc553333ad0f69305944221c) Thanks [@zoruka](https://github.com/zoruka)! - Add better error message when reown authentication is not enabled

- [#4817](https://github.com/reown-com/appkit/pull/4817) [`b0fe149`](https://github.com/reown-com/appkit/commit/b0fe1499bc24b31d0be8188f907b5daf42a9b10f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where using `<w3m-button>` with multichain didn't reflect the latest state changes and fixed send flow issues on solana when using multichain

- [#4787](https://github.com/reown-com/appkit/pull/4787) [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Updated `@walletconnect` deps to `2.21.7`

- [#4750](https://github.com/reown-com/appkit/pull/4750) [`cd762e8`](https://github.com/reown-com/appkit/commit/cd762e8f8c8100d31df1578372def3ce02d31919) Thanks [@zoruka](https://github.com/zoruka)! - Move ReownAuthentication class into @reown/appkit-controllers package and implementing an easy integration through AppKit features and remote features.

- Updated dependencies [[`bd813fb`](https://github.com/reown-com/appkit/commit/bd813fb4e827a43ecdacbf4b3cf7dc8ce84754b2), [`e040633`](https://github.com/reown-com/appkit/commit/e0406337b25b68dd8a774de099324c8edabc140f), [`a3ea12d`](https://github.com/reown-com/appkit/commit/a3ea12de7640f6a40967964b8080a15c72a8e03b), [`0f32a68`](https://github.com/reown-com/appkit/commit/0f32a682ac4daa704bf39c932c38f92ee97e2318), [`ce475a4`](https://github.com/reown-com/appkit/commit/ce475a43d29752a4cb6370caa2c07815456aa38d), [`dd8479d`](https://github.com/reown-com/appkit/commit/dd8479d6ed902a96aa9de0bbd7a64f64139a3a0c), [`c8f202b`](https://github.com/reown-com/appkit/commit/c8f202bcba777f3fc38aff6618ef4bd0e19fce2b), [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e), [`fe60caa`](https://github.com/reown-com/appkit/commit/fe60caa73f218c85521ace9825f593a2862f96c4), [`d4eeff9`](https://github.com/reown-com/appkit/commit/d4eeff99b649cea9c9bfe6cb8bc590e40c2978bf), [`5274c54`](https://github.com/reown-com/appkit/commit/5274c54ac5fd5d18dc553333ad0f69305944221c), [`a3ea12d`](https://github.com/reown-com/appkit/commit/a3ea12de7640f6a40967964b8080a15c72a8e03b), [`b0fe149`](https://github.com/reown-com/appkit/commit/b0fe1499bc24b31d0be8188f907b5daf42a9b10f), [`a6335d3`](https://github.com/reown-com/appkit/commit/a6335d370fc9f7e343f6a3c2b61f1a465cdf73e4), [`8411cf9`](https://github.com/reown-com/appkit/commit/8411cf984c6b46cbd7f205233205bf960be5bc1e), [`cd762e8`](https://github.com/reown-com/appkit/commit/cd762e8f8c8100d31df1578372def3ce02d31919)]:
  - @reown/appkit-common@1.7.20
  - @reown/appkit-controllers@1.7.20
  - @reown/appkit-polyfills@1.7.20
  - @reown/appkit-wallet@1.7.20

## 1.7.19

### Patch Changes

- [#4747](https://github.com/reown-com/appkit/pull/4747) [`cbe17ff`](https://github.com/reown-com/appkit/commit/cbe17ffc0a4a7d8aa8ba9471f02d09f005629d0a) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Removed custom logic from EVM adapters that gets `capabilities` from `sessionProperties` as this resposibility should be delegated to the providers

- [#4792](https://github.com/reown-com/appkit/pull/4792) [`2bccf2a`](https://github.com/reown-com/appkit/commit/2bccf2a36cbef80f53453228515cc3407ff8f96e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where secure site screens would break in demo

- Updated dependencies [[`cbe17ff`](https://github.com/reown-com/appkit/commit/cbe17ffc0a4a7d8aa8ba9471f02d09f005629d0a), [`2bccf2a`](https://github.com/reown-com/appkit/commit/2bccf2a36cbef80f53453228515cc3407ff8f96e)]:
  - @reown/appkit-common@1.7.19
  - @reown/appkit-controllers@1.7.19
  - @reown/appkit-polyfills@1.7.19
  - @reown/appkit-wallet@1.7.19

## 1.7.18

### Patch Changes

- [#4737](https://github.com/reown-com/appkit/pull/4737) [`f397324`](https://github.com/reown-com/appkit/commit/f3973243b1036b1a51b00331f52983e304c1f1a5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `allAccounts` didn't include the `publicKey` value

- [#4744](https://github.com/reown-com/appkit/pull/4744) [`673829b`](https://github.com/reown-com/appkit/commit/673829bfeff9934ab2233d5a14fcf6e45a9fd52b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where WalletConnect connections didn't include the `address` value when sending the `CONNECT_SUCCESS` event

- [#4717](https://github.com/reown-com/appkit/pull/4717) [`46c064d`](https://github.com/reown-com/appkit/commit/46c064d5f66e5d75754096507c77f31d083479d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where cancelling a SIWX message on mobile would reset the network state and log the user out

- [#4748](https://github.com/reown-com/appkit/pull/4748) [`9ae13b1`](https://github.com/reown-com/appkit/commit/9ae13b155dea440dddcbb3d8dd52e5fda84d8435) Thanks [@magiziz](https://github.com/magiziz)! - Added support for opening Binance Web3 Wallet via deeplink for Bitcoin

- Updated dependencies [[`f397324`](https://github.com/reown-com/appkit/commit/f3973243b1036b1a51b00331f52983e304c1f1a5), [`673829b`](https://github.com/reown-com/appkit/commit/673829bfeff9934ab2233d5a14fcf6e45a9fd52b), [`46c064d`](https://github.com/reown-com/appkit/commit/46c064d5f66e5d75754096507c77f31d083479d5), [`6407ad8`](https://github.com/reown-com/appkit/commit/6407ad8197f43fa14e006dd724abb0e58fec95f7), [`9ae13b1`](https://github.com/reown-com/appkit/commit/9ae13b155dea440dddcbb3d8dd52e5fda84d8435), [`6d4363a`](https://github.com/reown-com/appkit/commit/6d4363a33a82562addc98f8f6abbd231095fbc8f), [`f948216`](https://github.com/reown-com/appkit/commit/f9482168cc64f6cdc4a2d9e7b491c38c68630c76)]:
  - @reown/appkit-controllers@1.7.18
  - @reown/appkit-common@1.7.18
  - @reown/appkit-polyfills@1.7.18
  - @reown/appkit-wallet@1.7.18

## 1.7.17

### Patch Changes

- [#4688](https://github.com/reown-com/appkit/pull/4688) [`a457e61`](https://github.com/reown-com/appkit/commit/a457e61611a04fc19da8e09ece7fe7a11f04a2f4) Thanks [@magiziz](https://github.com/magiziz)! - Upgraded wallet button to support multichain via the `namespace` prop

  **Example usage with Components**

  ```tsx
  import { AppKitWalletButton } from '@reown/appkit-wallet-button/react'

  const wallets = [
    { wallet: 'metamask', namespace: 'eip155', label: 'MetaMask EVM' },
    { wallet: 'metamask', namespace: 'solana', label: 'MetaMask Solana' },
    { wallet: 'phantom', namespace: 'bip122', label: 'Phantom Bitcoin' }
  ]

  export function WalletButtons() {
    return (
      <>
        {wallets.map(({ wallet, namespace, label }) => (
          <AppKitWalletButton
            key={`${wallet}-${namespace}`}
            wallet={wallet}
            namespace={namespace}
          />
        ))}
      </>
    )
  }
  ```

  **Example usage with Hooks**

  ```tsx
  import { useAppKitWallet } from '@reown/appkit-wallet-button/react'

  export function YourApp() {
    const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
      namespace: 'eip155', // Use 'solana' or 'bip122' for other chains
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return (
      <>
        <button onClick={() => connect('walletConnect')}>Open QR modal</button>
        <button onClick={() => connect('metamask')}>Connect to MetaMask</button>
        <button onClick={() => connect('google')}>Connect to Google</button>
      </>
    )
  }
  ```

  **Example usage with Vanilla JS**

  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <script type="module">
        import '@reown/appkit-wallet-button'
        import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

        const wallet = createAppKitWalletButton({ namespace: 'eip155' })

        wallet.subscribeIsReady(({ isReady }) => {
          if (!isReady) return

          document.querySelectorAll('button[data-wallet]').forEach(button => {
            button.disabled = false
            button.onclick = () => {
              const id = button.getAttribute('data-wallet')
              wallet.connect(id)
            }
          })
        })
      </script>
    </head>
    <body>
      <appkit-wallet-button wallet="metamask" namespace="eip155"></appkit-wallet-button>

      <button data-wallet="walletConnect" disabled>Open QR modal</button>
      <button data-wallet="metamask" disabled>Connect to MetaMask</button>
      <button data-wallet="google" disabled>Connect to Google</button>
    </body>
  </html>
  ```

- [#4696](https://github.com/reown-com/appkit/pull/4696) [`2863286`](https://github.com/reown-com/appkit/commit/286328604c7d0a7dc16b5a23766831cf551f6dca) Thanks [@magiziz](https://github.com/magiziz)! - Introduced `AppKitProvider` React component for easy AppKit integration in React apps

  **Example usage**

  ```tsx
  import { AppKitProvider } from '@reown/appkit/react'

  function App() {
    return (
      <AppKitProvider
        projectId="YOUR_PROJECT_ID"
        networks={
          [
            /* Your Networks */
          ]
        }
      >
        {/* Your App */}
      </AppKitProvider>
    )
  }
  ```

- [#4690](https://github.com/reown-com/appkit/pull/4690) [`974c73f`](https://github.com/reown-com/appkit/commit/974c73f5532a1313bc89880997873169d70f7588) Thanks [@tomiir](https://github.com/tomiir)! - Adds sui and stacks as predefined networks.
  Exports `AVAILABLE_NAMESPACES` constant from `networks` and `common` packages.

- [#4704](https://github.com/reown-com/appkit/pull/4704) [`5391a12`](https://github.com/reown-com/appkit/commit/5391a12d952d561ad509ef7ffcdea280a31c0cb5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the update email view would not open when using the `useAppKitUpdateEmail` hook

- [#4687](https://github.com/reown-com/appkit/pull/4687) [`43e56fc`](https://github.com/reown-com/appkit/commit/43e56fcfe68005d963447f126277f422eb9bb3e1) Thanks [@enesozturk](https://github.com/enesozturk)! - Introduces AppKit React components. React users can now use the new components instead of HTML elements.

  ### Example

  ```jsx
  import { AppKitWalletButton } from '@reown/appkit-wallet-button/react'
  import { AppKitButton, AppKitNetworkButton } from '@reown/appkit/react'

  export function AppKitButtons() {
    return (
      <div>
        {/* Default */}
        <AppkitButton />
        <AppKitNetworkButton />
        <AppKitWalletButton wallet="metamask" />
        {/* With parameters */}
        <AppkitButton namespace="eip155" />
      </div>
    )
  }
  ```

- [#4449](https://github.com/reown-com/appkit/pull/4449) [`fde2340`](https://github.com/reown-com/appkit/commit/fde23403503105798f728c7c3ec86e2fb3925194) Thanks [@zoruka](https://github.com/zoruka)! - Add DataCapture views enabling integrating email collection for ReownAuthentication.

- [#4605](https://github.com/reown-com/appkit/pull/4605) [`e845518`](https://github.com/reown-com/appkit/commit/e845518e84a88d2b05d4e8a0af98787684ef0711) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates ChainController and AccountController utils, adds testing utils for controllers

- [#4686](https://github.com/reown-com/appkit/pull/4686) [`2a953de`](https://github.com/reown-com/appkit/commit/2a953deda4f6ad3333a45b1b0d074c5d8b8c8c65) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates error messages and adds error codes

- [#4708](https://github.com/reown-com/appkit/pull/4708) [`a5410b9`](https://github.com/reown-com/appkit/commit/a5410b94f4ec63cb901b3841c3fc0fdb67a08db6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the modal would close automatically after disconnecting a wallet from the profile view

- [#4709](https://github.com/reown-com/appkit/pull/4709) [`7d41aa6`](https://github.com/reown-com/appkit/commit/7d41aa6a9e647150c08caa65995339effbc5497d) Thanks [@zoruka](https://github.com/zoruka)! - Fix email capture flow for embedded wallet that was skiping due to one click auth

- Updated dependencies [[`a457e61`](https://github.com/reown-com/appkit/commit/a457e61611a04fc19da8e09ece7fe7a11f04a2f4), [`2863286`](https://github.com/reown-com/appkit/commit/286328604c7d0a7dc16b5a23766831cf551f6dca), [`974c73f`](https://github.com/reown-com/appkit/commit/974c73f5532a1313bc89880997873169d70f7588), [`f9e9842`](https://github.com/reown-com/appkit/commit/f9e98423ea3e2798e5d743af2c5cda45376a5ba9), [`5391a12`](https://github.com/reown-com/appkit/commit/5391a12d952d561ad509ef7ffcdea280a31c0cb5), [`43e56fc`](https://github.com/reown-com/appkit/commit/43e56fcfe68005d963447f126277f422eb9bb3e1), [`fde2340`](https://github.com/reown-com/appkit/commit/fde23403503105798f728c7c3ec86e2fb3925194), [`e845518`](https://github.com/reown-com/appkit/commit/e845518e84a88d2b05d4e8a0af98787684ef0711), [`2a953de`](https://github.com/reown-com/appkit/commit/2a953deda4f6ad3333a45b1b0d074c5d8b8c8c65), [`a5410b9`](https://github.com/reown-com/appkit/commit/a5410b94f4ec63cb901b3841c3fc0fdb67a08db6), [`7d41aa6`](https://github.com/reown-com/appkit/commit/7d41aa6a9e647150c08caa65995339effbc5497d)]:
  - @reown/appkit-controllers@1.7.17
  - @reown/appkit-common@1.7.17
  - @reown/appkit-polyfills@1.7.17
  - @reown/appkit-wallet@1.7.17

## 1.7.16

### Patch Changes

- [#4497](https://github.com/reown-com/appkit/pull/4497) [`cce9775`](https://github.com/reown-com/appkit/commit/cce97754c2c13411df65826adf99550bc5ad0f8c) Thanks [@venturars](https://github.com/venturars)! - Exports type definitions of Base class for better TS support when using hooks

- [#4666](https://github.com/reown-com/appkit/pull/4666) [`541318b`](https://github.com/reown-com/appkit/commit/541318bff54891503cfef10e194aaf22931fc01e) Thanks [@tomiir](https://github.com/tomiir)! - Updates @walletconnect/universal-provider to version 2.21.5

- Updated dependencies [[`7788000`](https://github.com/reown-com/appkit/commit/7788000628211880cf982f9b94b076ac90144114), [`cce9775`](https://github.com/reown-com/appkit/commit/cce97754c2c13411df65826adf99550bc5ad0f8c), [`541318b`](https://github.com/reown-com/appkit/commit/541318bff54891503cfef10e194aaf22931fc01e), [`3e2bd0a`](https://github.com/reown-com/appkit/commit/3e2bd0a60e92565ed128aa8643ccfdd6127ac65b)]:
  - @reown/appkit-controllers@1.7.16
  - @reown/appkit-common@1.7.16
  - @reown/appkit-polyfills@1.7.16
  - @reown/appkit-wallet@1.7.16

## 1.7.15

### Patch Changes

- [#4654](https://github.com/reown-com/appkit/pull/4654) [`d0b25bf`](https://github.com/reown-com/appkit/commit/d0b25bf2715d31ccc150580e20cb7556b8a06462) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Fixes spl-token dependency issues for appkit-util Solana clients

- Updated dependencies [[`4182dd8`](https://github.com/reown-com/appkit/commit/4182dd842453f4241b87b2aef96f647f206d2058)]:
  - @reown/appkit-controllers@1.7.15
  - @reown/appkit-common@1.7.15
  - @reown/appkit-polyfills@1.7.15
  - @reown/appkit-wallet@1.7.15

## 1.7.14

### Patch Changes

- [#4622](https://github.com/reown-com/appkit/pull/4622) [`b1555b2`](https://github.com/reown-com/appkit/commit/b1555b2e838f8b2a614ed048c28edc7298911917) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on network logics where some networks doesn't have required fields and causing issues

- [#4609](https://github.com/reown-com/appkit/pull/4609) [`c3e42fa`](https://github.com/reown-com/appkit/commit/c3e42fae24b059711c5094ca8f327ca8b6857041) Thanks [@tomiir](https://github.com/tomiir)! - Adds chainId parameter to CONNECT_SUCCESS and CONNECT_SOCIAL_SUCCESS events

- [#4560](https://github.com/reown-com/appkit/pull/4560) [`cfe8784`](https://github.com/reown-com/appkit/commit/cfe878474c8c58f856c117ca59ee702a5c1380c4) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Removes Coinbase OnRamp option as it's available under Meld's options

- [#4615](https://github.com/reown-com/appkit/pull/4615) [`127c7fe`](https://github.com/reown-com/appkit/commit/127c7fec63c2e4590dc74c369861b5efdda9cec4) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades `@solana/web3.js` to latest for high severity dependency issue

- [#4610](https://github.com/reown-com/appkit/pull/4610) [`9c73366`](https://github.com/reown-com/appkit/commit/9c73366f3650c1b368c4029f47e40163d14a83c3) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes unsyncing issue on initialization if enableReconnect is false

- [#4609](https://github.com/reown-com/appkit/pull/4609) [`c3e42fa`](https://github.com/reown-com/appkit/commit/c3e42fae24b059711c5094ca8f327ca8b6857041) Thanks [@tomiir](https://github.com/tomiir)! - Always fires INITIALIZE event regardless of analytics config

- [#4625](https://github.com/reown-com/appkit/pull/4625) [`a8212a7`](https://github.com/reown-com/appkit/commit/a8212a73ac3b323b4344a682133f87280b1ec4c2) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where approving ERC20 token spending with embedded wallet resulted in infinite spinner'

- [#4642](https://github.com/reown-com/appkit/pull/4642) [`bbc8193`](https://github.com/reown-com/appkit/commit/bbc81937ff6721e9339f76504cff95065a5c3dbe) Thanks [@enesozturk](https://github.com/enesozturk)! - Improves error messages with better clarity and phrasing

- [#4641](https://github.com/reown-com/appkit/pull/4641) [`9b7c7d0`](https://github.com/reown-com/appkit/commit/9b7c7d0cb812a9ccb9091fbb2c37604076c7f2bd) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on defaultAccountTypes where after disconnection it takes priority of whatever the last active account type is

- Updated dependencies [[`b1555b2`](https://github.com/reown-com/appkit/commit/b1555b2e838f8b2a614ed048c28edc7298911917), [`c3e42fa`](https://github.com/reown-com/appkit/commit/c3e42fae24b059711c5094ca8f327ca8b6857041), [`cfe8784`](https://github.com/reown-com/appkit/commit/cfe878474c8c58f856c117ca59ee702a5c1380c4), [`127c7fe`](https://github.com/reown-com/appkit/commit/127c7fec63c2e4590dc74c369861b5efdda9cec4), [`9c73366`](https://github.com/reown-com/appkit/commit/9c73366f3650c1b368c4029f47e40163d14a83c3), [`c3e42fa`](https://github.com/reown-com/appkit/commit/c3e42fae24b059711c5094ca8f327ca8b6857041), [`a8212a7`](https://github.com/reown-com/appkit/commit/a8212a73ac3b323b4344a682133f87280b1ec4c2), [`a083a94`](https://github.com/reown-com/appkit/commit/a083a941a87ae0658c34cf68a4381284d5acb67b), [`bbc8193`](https://github.com/reown-com/appkit/commit/bbc81937ff6721e9339f76504cff95065a5c3dbe), [`9b7c7d0`](https://github.com/reown-com/appkit/commit/9b7c7d0cb812a9ccb9091fbb2c37604076c7f2bd)]:
  - @reown/appkit-controllers@1.7.14
  - @reown/appkit-common@1.7.14
  - @reown/appkit-polyfills@1.7.14
  - @reown/appkit-wallet@1.7.14

## 1.7.13

### Patch Changes

- [#4581](https://github.com/reown-com/appkit/pull/4581) [`37aa39c`](https://github.com/reown-com/appkit/commit/37aa39c03f4a67253ff9cf7517408293a512c941) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Add 127.0.0.1 to the allowlist for localhost IP address support

- [#4600](https://github.com/reown-com/appkit/pull/4600) [`2d96652`](https://github.com/reown-com/appkit/commit/2d966523bb7d08218df00b9f333f00460f4c15a9) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes type castings and handles errors instead

- [#4358](https://github.com/reown-com/appkit/pull/4358) [`f76135f`](https://github.com/reown-com/appkit/commit/f76135fe25588faf610def5f0c5a2a9af9c25b45) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Valtio to v2

- [#4602](https://github.com/reown-com/appkit/pull/4602) [`ac76c05`](https://github.com/reown-com/appkit/commit/ac76c0545bab7ab2457e5d27889abfe7472115e2) Thanks [@tomiir](https://github.com/tomiir)! - Updates Smart Sessions validator with audited OwnableValidator contract by Rhinestone

- [#4492](https://github.com/reown-com/appkit/pull/4492) [`19d986f`](https://github.com/reown-com/appkit/commit/19d986fb0dbd15b14c5402c1e7aefdf364a3c908) Thanks [@zoruka](https://github.com/zoruka)! - Rename CloudAuthSIWX to ReownAuthentication keeping backwards compatibility.

- Updated dependencies [[`37aa39c`](https://github.com/reown-com/appkit/commit/37aa39c03f4a67253ff9cf7517408293a512c941), [`2d96652`](https://github.com/reown-com/appkit/commit/2d966523bb7d08218df00b9f333f00460f4c15a9), [`f76135f`](https://github.com/reown-com/appkit/commit/f76135fe25588faf610def5f0c5a2a9af9c25b45), [`ac76c05`](https://github.com/reown-com/appkit/commit/ac76c0545bab7ab2457e5d27889abfe7472115e2), [`19d986f`](https://github.com/reown-com/appkit/commit/19d986fb0dbd15b14c5402c1e7aefdf364a3c908)]:
  - @reown/appkit-common@1.7.13
  - @reown/appkit-controllers@1.7.13
  - @reown/appkit-polyfills@1.7.13
  - @reown/appkit-wallet@1.7.13

## 1.7.12

### Patch Changes

- [#4525](https://github.com/reown-com/appkit/pull/4525) [`f17c13a`](https://github.com/reown-com/appkit/commit/f17c13a584ca121416d73eb65f8e02bf6f2a34b1) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates Bitcoin adapter's WalletStandardConnector to have switch network functionality from wallet's features

- [#4595](https://github.com/reown-com/appkit/pull/4595) [`6ff6759`](https://github.com/reown-com/appkit/commit/6ff675996c52a46280370227165c532047f0fd63) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates balance fetch on Ethers and Ethers5 adapters to make sure to resolve promise to not block initialization

- [#4551](https://github.com/reown-com/appkit/pull/4551) [`6c0a28b`](https://github.com/reown-com/appkit/commit/6c0a28b5c548d4524cba06e2048233d8d96982c3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where declining a SIWX signature showed an incorrect error message

- [#4575](https://github.com/reown-com/appkit/pull/4575) [`3eae9b3`](https://github.com/reown-com/appkit/commit/3eae9b34dbe58760ee5d0bf585743f2f880e4392) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Adds supports for 1CA in Embedded Wallet flows

- [#4570](https://github.com/reown-com/appkit/pull/4570) [`df78462`](https://github.com/reown-com/appkit/commit/df78462e0e72ca23459b8fdaa31406906a99d153) Thanks [@tomiir](https://github.com/tomiir)! - Add forwarding of custom RPC urls to be used in embedded wallet requests

- [#4569](https://github.com/reown-com/appkit/pull/4569) [`a5870fa`](https://github.com/reown-com/appkit/commit/a5870fa6c87c9ce76bf1683543ddc325b04f0331) Thanks [@zoruka](https://github.com/zoruka)! - Introduce signOutOnDisconnect SIWXConfig flag and fix the same flag on SIWE that was not working properly.

- [#4577](https://github.com/reown-com/appkit/pull/4577) [`2b5c17c`](https://github.com/reown-com/appkit/commit/2b5c17cc4dc938543371208994acba56e15dba6a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where switching network using wagmi used the walletconnect rpc instead of wagmi rpc

- Updated dependencies [[`f17c13a`](https://github.com/reown-com/appkit/commit/f17c13a584ca121416d73eb65f8e02bf6f2a34b1), [`22f7796`](https://github.com/reown-com/appkit/commit/22f77965d5c782b5bcf155caab41876e5c911629), [`6ff6759`](https://github.com/reown-com/appkit/commit/6ff675996c52a46280370227165c532047f0fd63), [`6c0a28b`](https://github.com/reown-com/appkit/commit/6c0a28b5c548d4524cba06e2048233d8d96982c3), [`3eae9b3`](https://github.com/reown-com/appkit/commit/3eae9b34dbe58760ee5d0bf585743f2f880e4392), [`df78462`](https://github.com/reown-com/appkit/commit/df78462e0e72ca23459b8fdaa31406906a99d153), [`a5870fa`](https://github.com/reown-com/appkit/commit/a5870fa6c87c9ce76bf1683543ddc325b04f0331), [`2b5c17c`](https://github.com/reown-com/appkit/commit/2b5c17cc4dc938543371208994acba56e15dba6a)]:
  - @reown/appkit-common@1.7.12
  - @reown/appkit-controllers@1.7.12
  - @reown/appkit-polyfills@1.7.12
  - @reown/appkit-wallet@1.7.12

## 1.7.11

### Patch Changes

- [#4509](https://github.com/reown-com/appkit/pull/4509) [`c0e7b37`](https://github.com/reown-com/appkit/commit/c0e7b370f6eaa7503a4e9eb68b3677084e5e7483) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on Bitcoin adapter where getActiveNetwork function get's network of other namespaces

- [#4518](https://github.com/reown-com/appkit/pull/4518) [`4c517ac`](https://github.com/reown-com/appkit/commit/4c517ac9ee245fa299db5c8f3956148e0d87fdd6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where if a wallet doesnt have rdns it could show up as a duplicate connector in connect screen

- [#4530](https://github.com/reown-com/appkit/pull/4530) [`269f621`](https://github.com/reown-com/appkit/commit/269f621b08d9cedd9176796df39499f196f8a23f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where closing modal instead of cancelling the request would cause desync with embedded wallet modal state

- [#4523](https://github.com/reown-com/appkit/pull/4523) [`7272728`](https://github.com/reown-com/appkit/commit/72727285c398cae29d3848c937a1c5c9d9ec5496) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue for the embedded wallet use case where switching network doesn't redirect AppKit back to previous screen

- [#4526](https://github.com/reown-com/appkit/pull/4526) [`1bef587`](https://github.com/reown-com/appkit/commit/1bef5871476467662d499747fa828583c3d0b52c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where AppKit would open sign message screen after it falls back to previous SIWE session

- [#4529](https://github.com/reown-com/appkit/pull/4529) [`96d8b3f`](https://github.com/reown-com/appkit/commit/96d8b3f6bc30380e350f4e2c62cd6b3504ca753b) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on swap transaction order on UI for image and descriptions

- [#4537](https://github.com/reown-com/appkit/pull/4537) [`e82d88b`](https://github.com/reown-com/appkit/commit/e82d88b88d5a5212c792d07063fad10dd5435c1b) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Viem and Wagmi dependencies

- [#4471](https://github.com/reown-com/appkit/pull/4471) [`ab4b093`](https://github.com/reown-com/appkit/commit/ab4b093d226aca7c5053001f1fdd3e13f7d68cc0) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue on the embedded wallet where rpc requests didn't target the correct chainId

- [#4501](https://github.com/reown-com/appkit/pull/4501) [`c7d293b`](https://github.com/reown-com/appkit/commit/c7d293b41c18a40c76e9cff793138e5adf53ff7e) Thanks [@tomiir](https://github.com/tomiir)! - Adds registerWalletStandard flag to allow automatic registration of WalletConnect relay connector as a Wallet Standard wallet

- [#4547](https://github.com/reown-com/appkit/pull/4547) [`52677fb`](https://github.com/reown-com/appkit/commit/52677fb5784c4f0da6454c2b4f0be6bc20330276) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where enableEIP6963 didn't result into the expected behaviour on wagmi adapter

- [#4553](https://github.com/reown-com/appkit/pull/4553) [`7b64297`](https://github.com/reown-com/appkit/commit/7b64297a47e1d8c9fa86490e01ba800825987512) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds `enableReconnect` flag to prevent automatic reconnection on initialization and page load.

  ### Example usage:

  ```jsx
  createAppKit({
    networks: [...],
    metadata: {...},
    enableReconnect: false // disables reconnection
  })
  ```

- [#4544](https://github.com/reown-com/appkit/pull/4544) [`47663ce`](https://github.com/reown-com/appkit/commit/47663ce7e7f7b1fcd26ba52b1d21f73b7048a27c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes a case where AppKit would stay in the wrong network when enableNetworkSwitch is disabled

- [#4552](https://github.com/reown-com/appkit/pull/4552) [`c5e0650`](https://github.com/reown-com/appkit/commit/c5e065028ce8ca3e88b3cd66962c5a19cf1808e9) Thanks [@magiziz](https://github.com/magiziz)! - Fixes issue where appkit.disconnect would not disconnect all namespaces when no parameter was provided

- [#4519](https://github.com/reown-com/appkit/pull/4519) [`4416586`](https://github.com/reown-com/appkit/commit/4416586acc1439ebdfdc29ff24c2426627dca5ed) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add version check script so devs get a warning if there is a mismatch between used appkit version

- [#4545](https://github.com/reown-com/appkit/pull/4545) [`b9fd168`](https://github.com/reown-com/appkit/commit/b9fd168a16733fbe5434e8aa8ab815430a45aff6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Sats Connect connectors (e.g Leather and Xverse) didn't appear in the connect modal after page load

- [#4554](https://github.com/reown-com/appkit/pull/4554) [`f3717ce`](https://github.com/reown-com/appkit/commit/f3717ce9d8acef53dba3794e386cb3f7695d2a72) Thanks [@tomiir](https://github.com/tomiir)! - Makes `chainId` optional in RPC requests

- Updated dependencies [[`c0e7b37`](https://github.com/reown-com/appkit/commit/c0e7b370f6eaa7503a4e9eb68b3677084e5e7483), [`4c517ac`](https://github.com/reown-com/appkit/commit/4c517ac9ee245fa299db5c8f3956148e0d87fdd6), [`269f621`](https://github.com/reown-com/appkit/commit/269f621b08d9cedd9176796df39499f196f8a23f), [`7272728`](https://github.com/reown-com/appkit/commit/72727285c398cae29d3848c937a1c5c9d9ec5496), [`1bef587`](https://github.com/reown-com/appkit/commit/1bef5871476467662d499747fa828583c3d0b52c), [`96d8b3f`](https://github.com/reown-com/appkit/commit/96d8b3f6bc30380e350f4e2c62cd6b3504ca753b), [`e82d88b`](https://github.com/reown-com/appkit/commit/e82d88b88d5a5212c792d07063fad10dd5435c1b), [`ab4b093`](https://github.com/reown-com/appkit/commit/ab4b093d226aca7c5053001f1fdd3e13f7d68cc0), [`c7d293b`](https://github.com/reown-com/appkit/commit/c7d293b41c18a40c76e9cff793138e5adf53ff7e), [`52677fb`](https://github.com/reown-com/appkit/commit/52677fb5784c4f0da6454c2b4f0be6bc20330276), [`7b64297`](https://github.com/reown-com/appkit/commit/7b64297a47e1d8c9fa86490e01ba800825987512), [`47663ce`](https://github.com/reown-com/appkit/commit/47663ce7e7f7b1fcd26ba52b1d21f73b7048a27c), [`c5e0650`](https://github.com/reown-com/appkit/commit/c5e065028ce8ca3e88b3cd66962c5a19cf1808e9), [`4416586`](https://github.com/reown-com/appkit/commit/4416586acc1439ebdfdc29ff24c2426627dca5ed), [`b9fd168`](https://github.com/reown-com/appkit/commit/b9fd168a16733fbe5434e8aa8ab815430a45aff6), [`f3717ce`](https://github.com/reown-com/appkit/commit/f3717ce9d8acef53dba3794e386cb3f7695d2a72)]:
  - @reown/appkit-common@1.7.11
  - @reown/appkit-controllers@1.7.11
  - @reown/appkit-polyfills@1.7.11
  - @reown/appkit-wallet@1.7.11

## 1.7.10

### Patch Changes

- [#4510](https://github.com/reown-com/appkit/pull/4510) [`7227468`](https://github.com/reown-com/appkit/commit/7227468e72acff12fcfb281c83941bec4ec06b03) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the universal provider would hang forever if JWT verification failed during initialization

- [#4491](https://github.com/reown-com/appkit/pull/4491) [`0646651`](https://github.com/reown-com/appkit/commit/064665169d48c4c3456edf48f67ff25b3d07f678) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where SIWX sign message view was opening in One-Click-Auth flows

- [#4498](https://github.com/reown-com/appkit/pull/4498) [`0dfe08b`](https://github.com/reown-com/appkit/commit/0dfe08b3d4b9addb675445d22adb350fb5d18fc3) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where Global JSX namespace gets polluted, instead extend it

- [#4442](https://github.com/reown-com/appkit/pull/4442) [`255b3ac`](https://github.com/reown-com/appkit/commit/255b3ac1bbd649b05af310146f84ad3fd7b6898b) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add logic to fallback to previous SIWE session if request is canceled for current network

- Updated dependencies [[`7227468`](https://github.com/reown-com/appkit/commit/7227468e72acff12fcfb281c83941bec4ec06b03), [`0646651`](https://github.com/reown-com/appkit/commit/064665169d48c4c3456edf48f67ff25b3d07f678), [`0dfe08b`](https://github.com/reown-com/appkit/commit/0dfe08b3d4b9addb675445d22adb350fb5d18fc3), [`255b3ac`](https://github.com/reown-com/appkit/commit/255b3ac1bbd649b05af310146f84ad3fd7b6898b)]:
  - @reown/appkit-controllers@1.7.10
  - @reown/appkit-common@1.7.10
  - @reown/appkit-polyfills@1.7.10
  - @reown/appkit-wallet@1.7.10

## 1.7.9

### Patch Changes

- [#4437](https://github.com/reown-com/appkit/pull/4437) [`8a42584`](https://github.com/reown-com/appkit/commit/8a425847216ef8660312c88f3f009e6f2ceb53ea) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Improved error handling for `/origins` server error

- [#4479](https://github.com/reown-com/appkit/pull/4479) [`c6eb67f`](https://github.com/reown-com/appkit/commit/c6eb67fe9f43fe889452f4f13030239bc23e1540) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes an issue on auth provider where it doesn't respect the last connected network and default to first available network of EVM adapter on page load

- [#4472](https://github.com/reown-com/appkit/pull/4472) [`8bff121`](https://github.com/reown-com/appkit/commit/8bff12156788762e56d5aaa3cefd19f3c06db937) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - increase wallet button coverage

- [#4466](https://github.com/reown-com/appkit/pull/4466) [`024a99d`](https://github.com/reown-com/appkit/commit/024a99dc650d950156378e77ec423d711a8f0004) Thanks [@tomiir](https://github.com/tomiir)! - Changes `wallet_addEthereumChain` behavior in wagmi to use the chain's original rpc url instead of blockchain API url

- [#4452](https://github.com/reown-com/appkit/pull/4452) [`dd3a7dd`](https://github.com/reown-com/appkit/commit/dd3a7ddb87eaf295f453c13ccba753897cccfbce) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix OKX Wallet Bitcoin issue where it was not able to connect properly in Bitcoin environments

- [#4455](https://github.com/reown-com/appkit/pull/4455) [`c2c1d78`](https://github.com/reown-com/appkit/commit/c2c1d78894283cf4d58fcdfc66c0f69a07fc9e91) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Updates Onramp provider sort

- [#4464](https://github.com/reown-com/appkit/pull/4464) [`a8fa4fb`](https://github.com/reown-com/appkit/commit/a8fa4fbdfb54cc185f656276929ea9635b07a4c0) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on WalletConnect connector is not reconnecting on page load

- [#4453](https://github.com/reown-com/appkit/pull/4453) [`87959b5`](https://github.com/reown-com/appkit/commit/87959b5990c15703854fe33f8123b73e5d61fe59) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on AppKit buttons with namespace where the correct account state is not being shown to the user on page load

- [#4478](https://github.com/reown-com/appkit/pull/4478) [`5201905`](https://github.com/reown-com/appkit/commit/52019051165de70aa5ce300f5ca51c189408f4f7) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue on multichain where we are disconnecting namespaces if they are not in the WC connection's available namespaces

- [#4441](https://github.com/reown-com/appkit/pull/4441) [`00b2975`](https://github.com/reown-com/appkit/commit/00b2975fb57e67ab54c97b4154a90cc4715723b2) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors token balance util to use getAssets call only when using Auth provider

- [#4494](https://github.com/reown-com/appkit/pull/4494) [`352f41b`](https://github.com/reown-com/appkit/commit/352f41bfc53c257362efbe6067ac03dc8dd92ec4) Thanks [@zoruka](https://github.com/zoruka)! - Cloud Auth SIWX skip get sessions if token is not set

- Updated dependencies [[`8a42584`](https://github.com/reown-com/appkit/commit/8a425847216ef8660312c88f3f009e6f2ceb53ea), [`c6eb67f`](https://github.com/reown-com/appkit/commit/c6eb67fe9f43fe889452f4f13030239bc23e1540), [`8bff121`](https://github.com/reown-com/appkit/commit/8bff12156788762e56d5aaa3cefd19f3c06db937), [`024a99d`](https://github.com/reown-com/appkit/commit/024a99dc650d950156378e77ec423d711a8f0004), [`dd3a7dd`](https://github.com/reown-com/appkit/commit/dd3a7ddb87eaf295f453c13ccba753897cccfbce), [`c2c1d78`](https://github.com/reown-com/appkit/commit/c2c1d78894283cf4d58fcdfc66c0f69a07fc9e91), [`a8fa4fb`](https://github.com/reown-com/appkit/commit/a8fa4fbdfb54cc185f656276929ea9635b07a4c0), [`87959b5`](https://github.com/reown-com/appkit/commit/87959b5990c15703854fe33f8123b73e5d61fe59), [`5201905`](https://github.com/reown-com/appkit/commit/52019051165de70aa5ce300f5ca51c189408f4f7), [`00b2975`](https://github.com/reown-com/appkit/commit/00b2975fb57e67ab54c97b4154a90cc4715723b2), [`352f41b`](https://github.com/reown-com/appkit/commit/352f41bfc53c257362efbe6067ac03dc8dd92ec4)]:
  - @reown/appkit-controllers@1.7.9
  - @reown/appkit-common@1.7.9
  - @reown/appkit-polyfills@1.7.9
  - @reown/appkit-wallet@1.7.9

## 1.7.8

### Patch Changes

- [#4394](https://github.com/reown-com/appkit/pull/4394) [`2171cb4`](https://github.com/reown-com/appkit/commit/2171cb4d2f36cc0203a6f42d7c7c7d9773f7656c) Thanks [@tomiir](https://github.com/tomiir)! - Makes CaipNetwork generic so that arbitrary namespaces can be used to create networks

- [#4433](https://github.com/reown-com/appkit/pull/4433) [`c8292f8`](https://github.com/reown-com/appkit/commit/c8292f89b6e607eb1ddaa8047ed32aa175bff70c) Thanks [@tomiir](https://github.com/tomiir)! - Adds automatic safe connector support to ethers and ethers5 clients

- [#4417](https://github.com/reown-com/appkit/pull/4417) [`c71afc1`](https://github.com/reown-com/appkit/commit/c71afc13362badd2d0c5eb9fa7453f2e1faffee4) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes issue where wagmi had a different chain state than AppKit

- [#4438](https://github.com/reown-com/appkit/pull/4438) [`d1fb3c8`](https://github.com/reown-com/appkit/commit/d1fb3c8c1a9c1cf7818806a725403838aec4a7c6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where getAccount doesn't return the embeddedWalletInfo

- [#4380](https://github.com/reown-com/appkit/pull/4380) [`30dbd46`](https://github.com/reown-com/appkit/commit/30dbd46897e69ccdd71e8722ff711aa0c1f28055) Thanks [@tomiir](https://github.com/tomiir)! - Adds Safe Apps SDK support by default on wagmi

- [#4410](https://github.com/reown-com/appkit/pull/4410) [`76c2ed6`](https://github.com/reown-com/appkit/commit/76c2ed68239f30b801de2d5ff05ced9b1442226a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors network switching logics on modal open where we shouldn't properly make AppKit switch network

- [#4413](https://github.com/reown-com/appkit/pull/4413) [`62fe412`](https://github.com/reown-com/appkit/commit/62fe412a6c618fca24826ab77b927bc6fdefde1a) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where we are adding wagmi connectors to our controllers double time which causes connection sync issues at some environments like Vue and causes performance issues

- [#4395](https://github.com/reown-com/appkit/pull/4395) [`38d44e7`](https://github.com/reown-com/appkit/commit/38d44e79cc753adf01becd64a39aa20cbe1504fa) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where some extension wallets would not be properly disconnected when requested via a hook.

- [#4432](https://github.com/reown-com/appkit/pull/4432) [`aa23b67`](https://github.com/reown-com/appkit/commit/aa23b671df3a0f30fb3ff11ff7deab2408144049) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes remote configs util getting email and social enabled for AppKit Basic

- [#4436](https://github.com/reown-com/appkit/pull/4436) [`2aa4ba2`](https://github.com/reown-com/appkit/commit/2aa4ba26cfc2c44f606f83ca24119887bc71c816) Thanks [@tomiir](https://github.com/tomiir)! - Adds support for Solflare wallet deeplinking in mobile environments

- Updated dependencies [[`2171cb4`](https://github.com/reown-com/appkit/commit/2171cb4d2f36cc0203a6f42d7c7c7d9773f7656c), [`c8292f8`](https://github.com/reown-com/appkit/commit/c8292f89b6e607eb1ddaa8047ed32aa175bff70c), [`c71afc1`](https://github.com/reown-com/appkit/commit/c71afc13362badd2d0c5eb9fa7453f2e1faffee4), [`d1fb3c8`](https://github.com/reown-com/appkit/commit/d1fb3c8c1a9c1cf7818806a725403838aec4a7c6), [`30dbd46`](https://github.com/reown-com/appkit/commit/30dbd46897e69ccdd71e8722ff711aa0c1f28055), [`76c2ed6`](https://github.com/reown-com/appkit/commit/76c2ed68239f30b801de2d5ff05ced9b1442226a), [`62fe412`](https://github.com/reown-com/appkit/commit/62fe412a6c618fca24826ab77b927bc6fdefde1a), [`38d44e7`](https://github.com/reown-com/appkit/commit/38d44e79cc753adf01becd64a39aa20cbe1504fa), [`aa23b67`](https://github.com/reown-com/appkit/commit/aa23b671df3a0f30fb3ff11ff7deab2408144049), [`2aa4ba2`](https://github.com/reown-com/appkit/commit/2aa4ba26cfc2c44f606f83ca24119887bc71c816)]:
  - @reown/appkit-controllers@1.7.8
  - @reown/appkit-polyfills@1.7.8
  - @reown/appkit-common@1.7.8
  - @reown/appkit-wallet@1.7.8

## 1.7.7

### Patch Changes

- [#4396](https://github.com/reown-com/appkit/pull/4396) [`e215835`](https://github.com/reown-com/appkit/commit/e215835e83375f06a1bcbb4d863fb67d70981dda) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes W3mFrameProvider initialization without current chain id which causes network sync issues betwen AppKit and Secure site

- [#4386](https://github.com/reown-com/appkit/pull/4386) [`a64d13c`](https://github.com/reown-com/appkit/commit/a64d13c737003d83fc9bc0b2ee1ebfab6f0469be) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Solflare instead of Coinbase would be excepted from not having a mobile_link to be displayed in All Wallets

- [#4384](https://github.com/reown-com/appkit/pull/4384) [`bf2570d`](https://github.com/reown-com/appkit/commit/bf2570daa33a79b3994d53529780086017cce218) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add `chainId` to connectSocial app event to solve cases where user is connecting to the wrong network

- [#4361](https://github.com/reown-com/appkit/pull/4361) [`5b26c53`](https://github.com/reown-com/appkit/commit/5b26c53f186d5ddf8d45fb8bf709fe3aa0adc8c2) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where auth provider's switch network is not getting called when switching to different namespace if that namespace is already connected before

- [#4408](https://github.com/reown-com/appkit/pull/4408) [`50bcf53`](https://github.com/reown-com/appkit/commit/50bcf53725a14baaf3445ddb7a5340564c821be4) Thanks [@tomiir](https://github.com/tomiir)! - fix: issue where wagmi would not clear connections properly in vue mobile contexts

- [#4404](https://github.com/reown-com/appkit/pull/4404) [`08f4981`](https://github.com/reown-com/appkit/commit/08f49817d6d74dec10f3cb1d0f21a74e85a5f026) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes an issue that can be seen on embedded mode where we are redirecting user to connect page instead of account page after connection

- [#4374](https://github.com/reown-com/appkit/pull/4374) [`d0d0c05`](https://github.com/reown-com/appkit/commit/d0d0c053c0178da81be7e55ab8d11125f8ca3f9a) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Updates SIWX message text to handle network name from CAIP network id

- [#4389](https://github.com/reown-com/appkit/pull/4389) [`974db88`](https://github.com/reown-com/appkit/commit/974db88133df3f98a38eaeeaab8eecd512c32ef9) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Fix modal closing on unsupported chain selection

- [#4392](https://github.com/reown-com/appkit/pull/4392) [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37) Thanks [@tomiir](https://github.com/tomiir)! - Simplifies routing logic to replace multiple parameters with callbacks for error success and cancel

- [#4318](https://github.com/reown-com/appkit/pull/4318) [`43e5a9d`](https://github.com/reown-com/appkit/commit/43e5a9d4f9e38f2b7da2c5bfe6166f62d18cc51c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add remote features configuration handling

- [#4392](https://github.com/reown-com/appkit/pull/4392) [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where ENS registration due to signature expiration error would result in modal closing without error message.

- [#4381](https://github.com/reown-com/appkit/pull/4381) [`6c12c21`](https://github.com/reown-com/appkit/commit/6c12c217eed139e2468d8d13f99dbc6af0f80947) Thanks [@tomiir](https://github.com/tomiir)! - Modified the fetchFeaturedWallets() function in ApiController.ts to create a new sorted array instead of sorting the array in place, ensuring the wallet order is preserved.

- [#4385](https://github.com/reown-com/appkit/pull/4385) [`e33b28f`](https://github.com/reown-com/appkit/commit/e33b28fc64401471f6a2fe908ea365409122af18) Thanks [@tomiir](https://github.com/tomiir)! - Adds externalCustomerId to meld url

- Updated dependencies [[`e215835`](https://github.com/reown-com/appkit/commit/e215835e83375f06a1bcbb4d863fb67d70981dda), [`a64d13c`](https://github.com/reown-com/appkit/commit/a64d13c737003d83fc9bc0b2ee1ebfab6f0469be), [`bf2570d`](https://github.com/reown-com/appkit/commit/bf2570daa33a79b3994d53529780086017cce218), [`5b26c53`](https://github.com/reown-com/appkit/commit/5b26c53f186d5ddf8d45fb8bf709fe3aa0adc8c2), [`50bcf53`](https://github.com/reown-com/appkit/commit/50bcf53725a14baaf3445ddb7a5340564c821be4), [`08f4981`](https://github.com/reown-com/appkit/commit/08f49817d6d74dec10f3cb1d0f21a74e85a5f026), [`d0d0c05`](https://github.com/reown-com/appkit/commit/d0d0c053c0178da81be7e55ab8d11125f8ca3f9a), [`974db88`](https://github.com/reown-com/appkit/commit/974db88133df3f98a38eaeeaab8eecd512c32ef9), [`8539b68`](https://github.com/reown-com/appkit/commit/8539b68de2acb9e9a75f719cefa128c88185567b), [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37), [`43e5a9d`](https://github.com/reown-com/appkit/commit/43e5a9d4f9e38f2b7da2c5bfe6166f62d18cc51c), [`5f2065b`](https://github.com/reown-com/appkit/commit/5f2065b1a9b655fdf48d71ae7087753231d62f37), [`6c12c21`](https://github.com/reown-com/appkit/commit/6c12c217eed139e2468d8d13f99dbc6af0f80947), [`e33b28f`](https://github.com/reown-com/appkit/commit/e33b28fc64401471f6a2fe908ea365409122af18)]:
  - @reown/appkit-common@1.7.7
  - @reown/appkit-controllers@1.7.7
  - @reown/appkit-polyfills@1.7.7
  - @reown/appkit-wallet@1.7.7

## 1.7.6

### Patch Changes

- [#4353](https://github.com/reown-com/appkit/pull/4353) [`3b74f1f`](https://github.com/reown-com/appkit/commit/3b74f1fef5a4498634cc744c37e05dbb7f2e2075) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Enaple Solana in AppKit Pay

- [#4347](https://github.com/reown-com/appkit/pull/4347) [`442b1fa`](https://github.com/reown-com/appkit/commit/442b1fa5211af3aaf8c3dfa4f0c2b39ffd740a60) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes chain parameter from the excluded wallets fetch request to not filter wallets by supported networks

- Updated dependencies [[`3b74f1f`](https://github.com/reown-com/appkit/commit/3b74f1fef5a4498634cc744c37e05dbb7f2e2075), [`442b1fa`](https://github.com/reown-com/appkit/commit/442b1fa5211af3aaf8c3dfa4f0c2b39ffd740a60)]:
  - @reown/appkit-common@1.7.6
  - @reown/appkit-controllers@1.7.6
  - @reown/appkit-polyfills@1.7.6
  - @reown/appkit-wallet@1.7.6

## 1.7.5

### Patch Changes

- [#4300](https://github.com/reown-com/appkit/pull/4300) [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where wallets without a valid mobile_link were listed on mobile devices

- [#4320](https://github.com/reown-com/appkit/pull/4320) [`997b6fc`](https://github.com/reown-com/appkit/commit/997b6fc20f73ba68f8815c659f3cae03de90d3c8) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Enable analytics for Pay feature

- [#4324](https://github.com/reown-com/appkit/pull/4324) [`a26ea94`](https://github.com/reown-com/appkit/commit/a26ea9498f21d5419e9c7fa0cc567bc5d04a5173) Thanks [@devin-ai-integration](https://github.com/apps/devin-ai-integration)! - Fixes wui-ux-by-reown to make it always displayed

- [#4313](https://github.com/reown-com/appkit/pull/4313) [`45025fc`](https://github.com/reown-com/appkit/commit/45025fc0d88444adad422ef219bea19ff8f98596) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade all dependencies with minor and patch updates

- [#4300](https://github.com/reown-com/appkit/pull/4300) [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where excludeWalletIds would not be properly set on api requests.

- [#4311](https://github.com/reown-com/appkit/pull/4311) [`a3c2f6c`](https://github.com/reown-com/appkit/commit/a3c2f6c9630ae1166383d850b79626a994b84821) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - This PR fixes an issue where the auth connector would override the previous account state when switching network (switching on auth connector in stead of using the already existing account state (with different provider)

- [#4312](https://github.com/reown-com/appkit/pull/4312) [`320fe23`](https://github.com/reown-com/appkit/commit/320fe2300481da1b5b0aeff74d88fa44b5bff03a) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies to latest

- [#4107](https://github.com/reown-com/appkit/pull/4107) [`5018edf`](https://github.com/reown-com/appkit/commit/5018edfea07ac55e143215182a07cdd84901306f) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - This change includes social login improvments. We will remove an abudant call that we make to our backend to receive the users data. Also changed the wallet schema according to the new data that we receive.

- [#4315](https://github.com/reown-com/appkit/pull/4315) [`1d6fa26`](https://github.com/reown-com/appkit/commit/1d6fa26731a5a47bea1d242cfdb59a17a4de42d0) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Fixed a bug where wagmi adapter wasn't using the dedicated `.getProvider()` api but a custom `.provider` prop which is unreliable in getting the provider

- [#4337](https://github.com/reown-com/appkit/pull/4337) [`e206f97`](https://github.com/reown-com/appkit/commit/e206f97ac30fafc507ffcfc765b2fca4f617e965) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would be wrongly synced in wagmi on refresh

- [#4341](https://github.com/reown-com/appkit/pull/4341) [`2feefeb`](https://github.com/reown-com/appkit/commit/2feefebeaab3e47baf2f3b3b189ed90d9f6e7ddd) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where defaultAccountTypes would not be respected

- [#4301](https://github.com/reown-com/appkit/pull/4301) [`2fb24ad`](https://github.com/reown-com/appkit/commit/2fb24ad36544ba9ca51d1504d10ea60a5abfd2e1) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where balance would not be properly updated after a send flow transaction'

- [#4340](https://github.com/reown-com/appkit/pull/4340) [`0405ab5`](https://github.com/reown-com/appkit/commit/0405ab5949092be4bcf9fb08190e15cdbb74460e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Phantom mobile wallet redirection for EVM/Bitcoin chains

- [#4344](https://github.com/reown-com/appkit/pull/4344) [`d4dc6c8`](https://github.com/reown-com/appkit/commit/d4dc6c89cd6abf8e355fc0f7fb7063df6b32d592) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - Add asset metadata to exchange fetching so the data can be preemptively filtered based on the supported asset

- [#4246](https://github.com/reown-com/appkit/pull/4246) [`0379974`](https://github.com/reown-com/appkit/commit/0379974137cb0a28f75220bd3c77d0ae35fd43c2) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade Solana packages to latest

- [#4348](https://github.com/reown-com/appkit/pull/4348) [`72f4658`](https://github.com/reown-com/appkit/commit/72f4658597bb9c15b94836cc3be4fa2078b1e163) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes send flow address input logic where it's not responding the given input as expected

- [#3598](https://github.com/reown-com/appkit/pull/3598) [`e7d3e71`](https://github.com/reown-com/appkit/commit/e7d3e71d72625e057d94b3768438b29a8b6f530e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Expose fetchBalance method so apps can call this function after a transaction has happened on their side

- [#4342](https://github.com/reown-com/appkit/pull/4342) [`c0a6ae8`](https://github.com/reown-com/appkit/commit/c0a6ae8ec385748f1b6f376ab80be12bd12e6810) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes connected wallet info state where it's using connector id when connector or provider is not found

- [#4303](https://github.com/reown-com/appkit/pull/4303) [`33b3693`](https://github.com/reown-com/appkit/commit/33b36933ab36f03bf060e5d9a1ad8f036ccfdee5) Thanks [@tomiir](https://github.com/tomiir)! - Adds try catch preventing error from bubbling up if fetching supported networks for Blockchain API fails'

- [#4294](https://github.com/reown-com/appkit/pull/4294) [`d23248f`](https://github.com/reown-com/appkit/commit/d23248fd68eaf6641bd3f1251e1e5a6df1e2e9c5) Thanks [@enesozturk](https://github.com/enesozturk)! - Calls Universal Link if the deeplink call is not worked as expected and UL is exist

- Updated dependencies [[`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff), [`997b6fc`](https://github.com/reown-com/appkit/commit/997b6fc20f73ba68f8815c659f3cae03de90d3c8), [`a26ea94`](https://github.com/reown-com/appkit/commit/a26ea9498f21d5419e9c7fa0cc567bc5d04a5173), [`45025fc`](https://github.com/reown-com/appkit/commit/45025fc0d88444adad422ef219bea19ff8f98596), [`b932466`](https://github.com/reown-com/appkit/commit/b9324661001d8aae205d151a4c7040a4832804ff), [`a3c2f6c`](https://github.com/reown-com/appkit/commit/a3c2f6c9630ae1166383d850b79626a994b84821), [`320fe23`](https://github.com/reown-com/appkit/commit/320fe2300481da1b5b0aeff74d88fa44b5bff03a), [`5018edf`](https://github.com/reown-com/appkit/commit/5018edfea07ac55e143215182a07cdd84901306f), [`1d6fa26`](https://github.com/reown-com/appkit/commit/1d6fa26731a5a47bea1d242cfdb59a17a4de42d0), [`e206f97`](https://github.com/reown-com/appkit/commit/e206f97ac30fafc507ffcfc765b2fca4f617e965), [`2feefeb`](https://github.com/reown-com/appkit/commit/2feefebeaab3e47baf2f3b3b189ed90d9f6e7ddd), [`2fb24ad`](https://github.com/reown-com/appkit/commit/2fb24ad36544ba9ca51d1504d10ea60a5abfd2e1), [`0405ab5`](https://github.com/reown-com/appkit/commit/0405ab5949092be4bcf9fb08190e15cdbb74460e), [`d4dc6c8`](https://github.com/reown-com/appkit/commit/d4dc6c89cd6abf8e355fc0f7fb7063df6b32d592), [`0379974`](https://github.com/reown-com/appkit/commit/0379974137cb0a28f75220bd3c77d0ae35fd43c2), [`72f4658`](https://github.com/reown-com/appkit/commit/72f4658597bb9c15b94836cc3be4fa2078b1e163), [`e7d3e71`](https://github.com/reown-com/appkit/commit/e7d3e71d72625e057d94b3768438b29a8b6f530e), [`c0a6ae8`](https://github.com/reown-com/appkit/commit/c0a6ae8ec385748f1b6f376ab80be12bd12e6810), [`33b3693`](https://github.com/reown-com/appkit/commit/33b36933ab36f03bf060e5d9a1ad8f036ccfdee5), [`d23248f`](https://github.com/reown-com/appkit/commit/d23248fd68eaf6641bd3f1251e1e5a6df1e2e9c5)]:
  - @reown/appkit-controllers@1.7.5
  - @reown/appkit-common@1.7.5
  - @reown/appkit-polyfills@1.7.5
  - @reown/appkit-wallet@1.7.5

## 1.7.4

### Patch Changes

- [#4296](https://github.com/reown-com/appkit/pull/4296) [`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where social login was not working in PWA environments

- [#4220](https://github.com/reown-com/appkit/pull/4220) [`f2f1b72`](https://github.com/reown-com/appkit/commit/f2f1b72387a7658abd6e8c3061c51e9811e8ce69) Thanks [@zoruka](https://github.com/zoruka)! - Update `CloudAuthSIWX` adding `data` allowing Cloud Auth to parse data from Solana and allowing user data to be displayed in Cloud dashboard.

- [#4087](https://github.com/reown-com/appkit/pull/4087) [`ce17d19`](https://github.com/reown-com/appkit/commit/ce17d19a7e26eb3bc1de7ecd4928dedef6b99c66) Thanks [@zoruka](https://github.com/zoruka)! - - Enable easier and more consistent use of cloud-side authentication features on the client side

  - Support app-specific extensions to SIWX through custom methods, exposed via generic getters or hooks, enabling flexible enhancements without altering core behavior

- [#4253](https://github.com/reown-com/appkit/pull/4253) [`00caf22`](https://github.com/reown-com/appkit/commit/00caf227b84476ab45e317b48f8a31bd14e48e78) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes connectors listing business logic when initializing AppKit, for dynamic customization use cases like Demo app specificially

- [#4281](https://github.com/reown-com/appkit/pull/4281) [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7) Thanks [@magiziz](https://github.com/magiziz)! - Added cosmos namespace

- [#4221](https://github.com/reown-com/appkit/pull/4221) [`f91ec17`](https://github.com/reown-com/appkit/commit/f91ec1770fdada058a658b62bd3f8f7bea00322e) Thanks [@zoruka](https://github.com/zoruka)! - Export BIP122Verifier and SIWX types in @reown/appkit-siwx package

- [#4287](https://github.com/reown-com/appkit/pull/4287) [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where embeddedWalletInfo would be populated even when connected to non-embedded wallets

- [#4224](https://github.com/reown-com/appkit/pull/4224) [`f6bddff`](https://github.com/reown-com/appkit/commit/f6bddffe8cea2d6696a6dd98ec8a57c17c6a02ac) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes synchronizing for all account types after account change

- [#4228](https://github.com/reown-com/appkit/pull/4228) [`bc0f260`](https://github.com/reown-com/appkit/commit/bc0f260beac036571c6e820953e69d14e087048b) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes network enable/disable logics on Demo app

- [#4248](https://github.com/reown-com/appkit/pull/4248) [`4aeb703`](https://github.com/reown-com/appkit/commit/4aeb703fc5bc44cfc6cb34b43758eb3fbb8ab005) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where sending an asset from a non-embedded wallet resulted in blank send view'

- [#4260](https://github.com/reown-com/appkit/pull/4260) [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Receive screen would show networks from other namespaces

- [#4279](https://github.com/reown-com/appkit/pull/4279) [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades sats-connect for network switching while connecting

- [#4299](https://github.com/reown-com/appkit/pull/4299) [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where deep links on mobile were not working properly

- [#4288](https://github.com/reown-com/appkit/pull/4288) [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would not be set on initial connection

- [#4291](https://github.com/reown-com/appkit/pull/4291) [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Open loading screen from the secure site for better UX in stead of opening blank screen

- [#4242](https://github.com/reown-com/appkit/pull/4242) [`a775335`](https://github.com/reown-com/appkit/commit/a775335b37e2080b3a181e57ccafda3dd196b836) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue causing a broken modal layout when using the embedded wallet

- [#4297](https://github.com/reown-com/appkit/pull/4297) [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Solely use the BlockChain API to make ENS calls. Removed all the adapter specific logic to retrieve the ENS name, address and avatar

- [#4283](https://github.com/reown-com/appkit/pull/4283) [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the "Get Started" button appeared in the connect view when both email and socials were disabled

- [#4292](https://github.com/reown-com/appkit/pull/4292) [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies to 2.20.x

- [#4226](https://github.com/reown-com/appkit/pull/4226) [`fae99c0`](https://github.com/reown-com/appkit/commit/fae99c0c160d62ca4e87716dedc91de2c4fdbd4e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where custom connectors weren't showing on mobile

- [#4290](https://github.com/reown-com/appkit/pull/4290) [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes gas estimations from swap inputs and calculations

- Updated dependencies [[`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef), [`f2f1b72`](https://github.com/reown-com/appkit/commit/f2f1b72387a7658abd6e8c3061c51e9811e8ce69), [`ce17d19`](https://github.com/reown-com/appkit/commit/ce17d19a7e26eb3bc1de7ecd4928dedef6b99c66), [`00caf22`](https://github.com/reown-com/appkit/commit/00caf227b84476ab45e317b48f8a31bd14e48e78), [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7), [`f91ec17`](https://github.com/reown-com/appkit/commit/f91ec1770fdada058a658b62bd3f8f7bea00322e), [`531da97`](https://github.com/reown-com/appkit/commit/531da979c89c3727ac3e190f709c6bd2dba8215c), [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2), [`f6bddff`](https://github.com/reown-com/appkit/commit/f6bddffe8cea2d6696a6dd98ec8a57c17c6a02ac), [`bc0f260`](https://github.com/reown-com/appkit/commit/bc0f260beac036571c6e820953e69d14e087048b), [`4aeb703`](https://github.com/reown-com/appkit/commit/4aeb703fc5bc44cfc6cb34b43758eb3fbb8ab005), [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85), [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa), [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca), [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27), [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440), [`a775335`](https://github.com/reown-com/appkit/commit/a775335b37e2080b3a181e57ccafda3dd196b836), [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542), [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce), [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93), [`fae99c0`](https://github.com/reown-com/appkit/commit/fae99c0c160d62ca4e87716dedc91de2c4fdbd4e), [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b)]:
  - @reown/appkit-controllers@1.7.4
  - @reown/appkit-common@1.7.4
  - @reown/appkit-polyfills@1.7.4
  - @reown/appkit-wallet@1.7.4

## 1.7.3

### Patch Changes

- [#4168](https://github.com/reown-com/appkit/pull/4168) [`ef34442`](https://github.com/reown-com/appkit/commit/ef344422ed50ce4b57b51858d477cd9a35513240) Thanks [@magiziz](https://github.com/magiziz)! - Enabled the activity button only for eip155 namespace

- [#4195](https://github.com/reown-com/appkit/pull/4195) [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where failing to get balance would result in unhandled error thrown

- [#4203](https://github.com/reown-com/appkit/pull/4203) [`cd48c5c`](https://github.com/reown-com/appkit/commit/cd48c5cc0878d4744a2021f96678b87726ad91c7) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where preferred account types would not be respected.
  Adds support for multi-chain account types, respecting default account types format.

- [#4172](https://github.com/reown-com/appkit/pull/4172) [`e73b101`](https://github.com/reown-com/appkit/commit/e73b101431197c72bd02101d767a4e0befecb47a) Thanks [@zoruka](https://github.com/zoruka)! - Add `arguments` param for `appkit.open` function and attach swap initial arguments when opening Swap view.

- [#4199](https://github.com/reown-com/appkit/pull/4199) [`9864836`](https://github.com/reown-com/appkit/commit/986483689adeb9d4c173f12f0ab67559db4f3a0b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the wallet connection would remain in a pending state after a user rejected the connection request

- [#4194](https://github.com/reown-com/appkit/pull/4194) [`de6daa7`](https://github.com/reown-com/appkit/commit/de6daa7ca6f8ef950be7008dc606415dd2843055) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes XVerse wallet doesn't emitting accountChanged event on connection

- [#4126](https://github.com/reown-com/appkit/pull/4126) [`116b854`](https://github.com/reown-com/appkit/commit/116b854b9d94192fad1d6a6f1b9b7e511ff118fe) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Fixes swap balance recent on network and account change

- [#4164](https://github.com/reown-com/appkit/pull/4164) [`c538a60`](https://github.com/reown-com/appkit/commit/c538a60c49c27ba32a8bb8362fe398811e624b47) Thanks [@magiziz](https://github.com/magiziz)! - Added required polyfills to `@reown/appkit-adapter-bitcoin` adapter package

- [#4205](https://github.com/reown-com/appkit/pull/4205) [`9a07836`](https://github.com/reown-com/appkit/commit/9a0783699bdb5d8cb211eef391227acd0ac2f1b6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed issue where `safe` wagmi connector was not hidden when excluded

- [#4157](https://github.com/reown-com/appkit/pull/4157) [`8b29cab`](https://github.com/reown-com/appkit/commit/8b29cab1b560351479f343e815f66e31fef184b3) Thanks [@magiziz](https://github.com/magiziz)! - Removed activity and nft tabs from account modal when using solana

- [#4186](https://github.com/reown-com/appkit/pull/4186) [`36c8b88`](https://github.com/reown-com/appkit/commit/36c8b88fd354503d2a4ca659870ca68f99a71248) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where a random swap error occurred when switching networks

- [#4195](https://github.com/reown-com/appkit/pull/4195) [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where networks not supported by Blockchain API would fail to execute requests in wagmi

- [#4151](https://github.com/reown-com/appkit/pull/4151) [`24f46dc`](https://github.com/reown-com/appkit/commit/24f46dcf1431f24a58e5fbd2d5e390e3e7a8cf0d) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors CAIP networks state read logics in connectors and adapters

- [#4177](https://github.com/reown-com/appkit/pull/4177) [`7c37818`](https://github.com/reown-com/appkit/commit/7c37818eaefe729c13c321a2e939df2a3c3242a1) Thanks [@enesozturk](https://github.com/enesozturk)! - Maps the sats-connect address type to AppKit's Bitcoin address purpose

- [#4143](https://github.com/reown-com/appkit/pull/4143) [`37b8f58`](https://github.com/reown-com/appkit/commit/37b8f581e6617678cec18578c280d4a002dba5d7) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies

- [#4187](https://github.com/reown-com/appkit/pull/4187) [`fd380eb`](https://github.com/reown-com/appkit/commit/fd380eb099c043db8c203f943692af94e8b00f5b) Thanks [@tomiir](https://github.com/tomiir)! - Adds `protocol` parameter to Bitcoin connectors' `signMessage`

- [#4197](https://github.com/reown-com/appkit/pull/4197) [`90d0f62`](https://github.com/reown-com/appkit/commit/90d0f626868258022cba7ab1ba04ac3abb759722) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where passing universalProvider parameter would cause INITIALIZE to not be fired

- [#4206](https://github.com/reown-com/appkit/pull/4206) [`e6cb6d1`](https://github.com/reown-com/appkit/commit/e6cb6d17276fbf66f3285e29b3a7507cd2a8b8cb) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where recent wallets were not hidden when included in `excludeWalletIds`

- [#4207](https://github.com/reown-com/appkit/pull/4207) [`55af442`](https://github.com/reown-com/appkit/commit/55af442d4d5d8ea6c8034309d759a6bb45128709) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the username from the embedded wallet info wasn’t properly synchronized

- [#4152](https://github.com/reown-com/appkit/pull/4152) [`08746a4`](https://github.com/reown-com/appkit/commit/08746a45d11ae994ede74c4309722a01c68e4c6c) Thanks [@magiziz](https://github.com/magiziz)! - Updated recent wallet list to only show wallets that match the current chain namespace

- [#4158](https://github.com/reown-com/appkit/pull/4158) [`12c3c3e`](https://github.com/reown-com/appkit/commit/12c3c3e15b162353666ca012cce51378dbc1aa40) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes add/remove chain adapter functionality for the Demo app use case and use CAIP networks by getCaipNetworks function in Base client

- [#4110](https://github.com/reown-com/appkit/pull/4110) [`7ee1f83`](https://github.com/reown-com/appkit/commit/7ee1f836670dea6d1b7ae6e5932157a7856595f5) Thanks [@arein](https://github.com/arein)! - Disable "Try Again" button when the client is not connected

- [#4195](https://github.com/reown-com/appkit/pull/4195) [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where `initialized` would not be set if an issue occurred during account sync.

- Updated dependencies [[`ef34442`](https://github.com/reown-com/appkit/commit/ef344422ed50ce4b57b51858d477cd9a35513240), [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0), [`cd48c5c`](https://github.com/reown-com/appkit/commit/cd48c5cc0878d4744a2021f96678b87726ad91c7), [`e73b101`](https://github.com/reown-com/appkit/commit/e73b101431197c72bd02101d767a4e0befecb47a), [`9864836`](https://github.com/reown-com/appkit/commit/986483689adeb9d4c173f12f0ab67559db4f3a0b), [`de6daa7`](https://github.com/reown-com/appkit/commit/de6daa7ca6f8ef950be7008dc606415dd2843055), [`116b854`](https://github.com/reown-com/appkit/commit/116b854b9d94192fad1d6a6f1b9b7e511ff118fe), [`c538a60`](https://github.com/reown-com/appkit/commit/c538a60c49c27ba32a8bb8362fe398811e624b47), [`9a07836`](https://github.com/reown-com/appkit/commit/9a0783699bdb5d8cb211eef391227acd0ac2f1b6), [`8b29cab`](https://github.com/reown-com/appkit/commit/8b29cab1b560351479f343e815f66e31fef184b3), [`36c8b88`](https://github.com/reown-com/appkit/commit/36c8b88fd354503d2a4ca659870ca68f99a71248), [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0), [`24f46dc`](https://github.com/reown-com/appkit/commit/24f46dcf1431f24a58e5fbd2d5e390e3e7a8cf0d), [`7c37818`](https://github.com/reown-com/appkit/commit/7c37818eaefe729c13c321a2e939df2a3c3242a1), [`37b8f58`](https://github.com/reown-com/appkit/commit/37b8f581e6617678cec18578c280d4a002dba5d7), [`fd380eb`](https://github.com/reown-com/appkit/commit/fd380eb099c043db8c203f943692af94e8b00f5b), [`90d0f62`](https://github.com/reown-com/appkit/commit/90d0f626868258022cba7ab1ba04ac3abb759722), [`e6cb6d1`](https://github.com/reown-com/appkit/commit/e6cb6d17276fbf66f3285e29b3a7507cd2a8b8cb), [`55af442`](https://github.com/reown-com/appkit/commit/55af442d4d5d8ea6c8034309d759a6bb45128709), [`08746a4`](https://github.com/reown-com/appkit/commit/08746a45d11ae994ede74c4309722a01c68e4c6c), [`12c3c3e`](https://github.com/reown-com/appkit/commit/12c3c3e15b162353666ca012cce51378dbc1aa40), [`318171e`](https://github.com/reown-com/appkit/commit/318171e7bcba74befb097e07d85ea83bf28982c0)]:
  - @reown/appkit-controllers@1.7.3
  - @reown/appkit-common@1.7.3
  - @reown/appkit-polyfills@1.7.3
  - @reown/appkit-wallet@1.7.3

## 1.7.2

### Patch Changes

- [#4100](https://github.com/reown-com/appkit/pull/4100) [`848ad47`](https://github.com/reown-com/appkit/commit/848ad47d64ddbea4cbe4768f7374f63f2fcdf8a5) Thanks [@KannuSingh](https://github.com/KannuSingh)! - adds support for customizing universal provider configuration via a new universalProviderConfigOverride option

- [#4104](https://github.com/reown-com/appkit/pull/4104) [`b18d2a9`](https://github.com/reown-com/appkit/commit/b18d2a958d5f9d60e6e88f35e6f2c99d8f9291d6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `createAppKit` would throw an error if the universal provider failed to initialize

- [#4127](https://github.com/reown-com/appkit/pull/4127) [`542985c`](https://github.com/reown-com/appkit/commit/542985c79888e9753a51466b098aff65898eeb00) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where swaps were not working properly when using the ethers/ethers5 adapter

- [#4091](https://github.com/reown-com/appkit/pull/4091) [`1fc664d`](https://github.com/reown-com/appkit/commit/1fc664db6b109ac2ce9c66aec31a3ae2d6419589) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the WalletConnect wallet button wasn't opening the "All Wallets" modal view on mobile devices

- [#4102](https://github.com/reown-com/appkit/pull/4102) [`ae79b16`](https://github.com/reown-com/appkit/commit/ae79b164833193c363abfc42d9dd9ce0864d81ca) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the swap screen froze if allowance approval failed

- [#3883](https://github.com/reown-com/appkit/pull/3883) [`4b951b1`](https://github.com/reown-com/appkit/commit/4b951b14faea38b465295f53ed0c70820ebea63c) Thanks [@tomiir](https://github.com/tomiir)! - Adds `enableNetworkSwitcher` prop to allow disabling of network switching in the modal

- [#4094](https://github.com/reown-com/appkit/pull/4094) [`af1e79a`](https://github.com/reown-com/appkit/commit/af1e79a76d32def90c9605dc8e53a2ade002033c) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users were required to re-check the legal checkbox after navigating away and returning to the connect view

- [#4109](https://github.com/reown-com/appkit/pull/4109) [`07e8b4e`](https://github.com/reown-com/appkit/commit/07e8b4e373181eb74af75c7a758998c5f129921e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `useAppKitProvider` hook from vue wasn't reflecting state changes in real-time

- [#4118](https://github.com/reown-com/appkit/pull/4118) [`b9871dc`](https://github.com/reown-com/appkit/commit/b9871dcea4f7e7aefa412f8a19318e7b60eda8a3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where preferred account type wasn't properly switching on initial connection when using email/social login

- [#4103](https://github.com/reown-com/appkit/pull/4103) [`afc0739`](https://github.com/reown-com/appkit/commit/afc073935348bc90414fda0c26134938383d9fcc) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes issue where switchin between appkit instances result network to be not detected as expected.

  When AppKit initialized, if local storage active CAIP network value is something AppKit doesn't support, AppKit will redirect to first available network.

- [#4120](https://github.com/reown-com/appkit/pull/4120) [`ab75760`](https://github.com/reown-com/appkit/commit/ab757609cd28340d2bffb8ef718a4bb3df9d85ad) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `excludeWalletIds` option wasn't properly filtering Bitcoin wallets

- Updated dependencies [[`848ad47`](https://github.com/reown-com/appkit/commit/848ad47d64ddbea4cbe4768f7374f63f2fcdf8a5), [`b18d2a9`](https://github.com/reown-com/appkit/commit/b18d2a958d5f9d60e6e88f35e6f2c99d8f9291d6), [`542985c`](https://github.com/reown-com/appkit/commit/542985c79888e9753a51466b098aff65898eeb00), [`1fc664d`](https://github.com/reown-com/appkit/commit/1fc664db6b109ac2ce9c66aec31a3ae2d6419589), [`ae79b16`](https://github.com/reown-com/appkit/commit/ae79b164833193c363abfc42d9dd9ce0864d81ca), [`4b951b1`](https://github.com/reown-com/appkit/commit/4b951b14faea38b465295f53ed0c70820ebea63c), [`af1e79a`](https://github.com/reown-com/appkit/commit/af1e79a76d32def90c9605dc8e53a2ade002033c), [`07e8b4e`](https://github.com/reown-com/appkit/commit/07e8b4e373181eb74af75c7a758998c5f129921e), [`b9871dc`](https://github.com/reown-com/appkit/commit/b9871dcea4f7e7aefa412f8a19318e7b60eda8a3), [`afc0739`](https://github.com/reown-com/appkit/commit/afc073935348bc90414fda0c26134938383d9fcc), [`ab75760`](https://github.com/reown-com/appkit/commit/ab757609cd28340d2bffb8ef718a4bb3df9d85ad)]:
  - @reown/appkit-controllers@1.7.2
  - @reown/appkit-common@1.7.2
  - @reown/appkit-polyfills@1.7.2
  - @reown/appkit-wallet@1.7.2

## 1.7.1

### Patch Changes

- [#4014](https://github.com/reown-com/appkit/pull/4014) [`a945a10`](https://github.com/reown-com/appkit/commit/a945a10bb1a3b2beb33d6d4015714c9d623b1c84) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where network and wallet images weren't prefetched after connection

- [#4045](https://github.com/reown-com/appkit/pull/4045) [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509) Thanks [@tomiir](https://github.com/tomiir)! - Updates solana dependencies to latest stable version

- [#4052](https://github.com/reown-com/appkit/pull/4052) [`e7480ec`](https://github.com/reown-com/appkit/commit/e7480ec82af910d795e15a01222852f44e517d45) Thanks [@arein](https://github.com/arein)! - Disable `open` button until connection established

- [#4042](https://github.com/reown-com/appkit/pull/4042) [`0f21f5f`](https://github.com/reown-com/appkit/commit/0f21f5faaf1e8d51adcfe3e7a686792c5a8a4bf9) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes recommended wallets listing when opening modal with namespace filter

- [#4077](https://github.com/reown-com/appkit/pull/4077) [`2f4bdc2`](https://github.com/reown-com/appkit/commit/2f4bdc2bf4bd0820ea3c9d070295905f5cb30032) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds `customRpcUrls` prop to override default RPC URLs of the networks for native RPC calls.

  **Example**

  Define your map of chain ID / URL objects:

  ```jsx
  const customRpcUrls = {
    'eip155:1': [{ url: 'https://your-custom-mainnet-url.com' }],
    'eip155:137': [{ url: 'https://your-custom-polygon-url.com' }]
  }
  ```

  Pass it to the AppKit's `createAppKit` function.

  Additionally, if you are using Wagmi adapter you need to pass same `customRpcUrls` prop to `WagmiAdapter`.

  ```jsx
  const wagmiAdapter = new WagmiAdapter({
    networks: [...],
    projectId: "project-id",
    customRpcUrls
  })

  const modal = createAppKit({
    adapters: [...],
    networks: [...],
    projectId: "project-id",
    customRpcUrls
  })
  ```

  **Passing network props**

  If you need to pass fetch configs for your transport, you can use `config` property:

  ```jsx
  const customRpcUrls = {
    'eip155:1': [
      {
        url: 'https://your-custom-mainnet-url.com',
        config: {
          fetchOptions: {
            headers: {
              'Content-Type': 'text/plain'
            }
          }
        }
      }
    ]
  }
  ```

- [#4037](https://github.com/reown-com/appkit/pull/4037) [`478bd96`](https://github.com/reown-com/appkit/commit/478bd96106508fe89756d9f4f782679294a3a62a) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixed connector listing when filtering by namespace

- [#4049](https://github.com/reown-com/appkit/pull/4049) [`c7994ea`](https://github.com/reown-com/appkit/commit/c7994ea5afea893304449d52ef67e9f3037c913a) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates Bitcoin networks image ids

- [#4054](https://github.com/reown-com/appkit/pull/4054) [`8665987`](https://github.com/reown-com/appkit/commit/8665987d958df1c5e98c773ee92c26e7c8b68e24) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes redundant namespace filter while switching between networks

- [#4041](https://github.com/reown-com/appkit/pull/4041) [`5c14b6e`](https://github.com/reown-com/appkit/commit/5c14b6eac7bdabfa93223c5ada263903e5c60273) Thanks [@tomiir](https://github.com/tomiir)! - Declares appkit packages in ui dependencies

- [#4030](https://github.com/reown-com/appkit/pull/4030) [`eeb2c84`](https://github.com/reown-com/appkit/commit/eeb2c842018a4d6215716f64e53a045cfa206f6c) Thanks [@enesozturk](https://github.com/enesozturk)! - Allows disconnecting specific namespace. Users can pass `ChainNamespace` value to `disconnect()` function returned from `useDisconnect`, and disconnect only given namespace.

  If namespace is not passed, it'll disconnect all namespaces.

  **Example usage:**

  ```tsx
  const { disconnect } = useDisconnect()

  <Button onClick={() => disconnect({ namespace: 'solana' })}>
    Disconnect Solana
  </Button>
  ```

- [#4035](https://github.com/reown-com/appkit/pull/4035) [`02a2d53`](https://github.com/reown-com/appkit/commit/02a2d53a87922c22f32c70c2a73b6b7a809f237c) Thanks [@tomiir](https://github.com/tomiir)! - Updates dependencies and applies overrides for nested subdependenceis with high level vulnerabilities

- [#4045](https://github.com/reown-com/appkit/pull/4045) [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509) Thanks [@tomiir](https://github.com/tomiir)! - Patches changesets action to allow for automatic canaries and GH Changelogs

- [#4046](https://github.com/reown-com/appkit/pull/4046) [`475e422`](https://github.com/reown-com/appkit/commit/475e422a1c02b85d5a314851aea56795e341ea7a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the CAIP address was not set for the namespace when using multichain

- [#4068](https://github.com/reown-com/appkit/pull/4068) [`7e6dfcd`](https://github.com/reown-com/appkit/commit/7e6dfcd77cded48cc3d1b004a37eba6464309d71) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Coinbase Wallet wasn't working with multichain

- [#4055](https://github.com/reown-com/appkit/pull/4055) [`4f79747`](https://github.com/reown-com/appkit/commit/4f79747373b65c020dcca7c7ac671dc1d31aa5f1) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds Bitcoin logo to wui-visual to use on chain switch screen

- [#3925](https://github.com/reown-com/appkit/pull/3925) [`093f24c`](https://github.com/reown-com/appkit/commit/093f24c69632aaeeb8ffe3120fadb6a65952ff3b) Thanks [@magiziz](https://github.com/magiziz)! - - Added email wallet button

  - Added email update functionality

  **TypeScript Example usage**

  ```ts
  import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

  const appKitWalletButton = createAppKitWalletButton()

  const connectEmail = async () => {
    const { address, chainId, chainNamespace } = await appKitWalletButton.connect('email')

    return { address, chainId, chainNamespace }
  }

  const updateEmail = async () => {
    const { email } = await appKitWalletButton.updateEmail()

    return email // Return the new updated email
  }
  ```

  **React Hook Example usage**

  ```tsx
  import { useAppKitUpdateEmail, useAppKitWallet } from '@reown/appkit-wallet-button/react'

  export function ConnectEmail() {
    const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return <button onClick={() => connect('email')}>Connect Email</button>
  }

  export function UpdateEmail() {
    const { data, error, isPending, isSuccess, isError, updateEmail } = useAppKitUpdateEmail({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return <button onClick={() => updateEmail()}>Update Email</button>
  }
  ```

- [#4048](https://github.com/reown-com/appkit/pull/4048) [`ffb8188`](https://github.com/reown-com/appkit/commit/ffb81887a0ce663ce55973118aeb2e7368ab284a) Thanks [@tomiir](https://github.com/tomiir)! - Interecepts Leather wallet image and injects the missing '+xml' declaration

- [#4074](https://github.com/reown-com/appkit/pull/4074) [`d59d1dc`](https://github.com/reown-com/appkit/commit/d59d1dcb0cec891dc20f531fbcd0b08eba77c9e2) Thanks [@magiziz](https://github.com/magiziz)! - Added support for customizing connector positions in connect modal.

  The array order determines the exact display order, in the example below the injected wallets will appear first, followed by WalletConnect and then recent wallets.

  **Example usage**

  ```tsx
  import { createAppKit } from '@reown/appkit'

  const modal = createAppKit({
    adapters: [], // Add your adapters here
    networks: [], // Add your networks here
    projectId: 'YOUR_PROJECT_ID',
    features: {
      connectorTypeOrder: ['injected', 'walletConnect', 'recent']
    }
  })
  ```

- Updated dependencies [[`a945a10`](https://github.com/reown-com/appkit/commit/a945a10bb1a3b2beb33d6d4015714c9d623b1c84), [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509), [`e7480ec`](https://github.com/reown-com/appkit/commit/e7480ec82af910d795e15a01222852f44e517d45), [`0f21f5f`](https://github.com/reown-com/appkit/commit/0f21f5faaf1e8d51adcfe3e7a686792c5a8a4bf9), [`2f4bdc2`](https://github.com/reown-com/appkit/commit/2f4bdc2bf4bd0820ea3c9d070295905f5cb30032), [`478bd96`](https://github.com/reown-com/appkit/commit/478bd96106508fe89756d9f4f782679294a3a62a), [`c7994ea`](https://github.com/reown-com/appkit/commit/c7994ea5afea893304449d52ef67e9f3037c913a), [`8665987`](https://github.com/reown-com/appkit/commit/8665987d958df1c5e98c773ee92c26e7c8b68e24), [`5c14b6e`](https://github.com/reown-com/appkit/commit/5c14b6eac7bdabfa93223c5ada263903e5c60273), [`eeb2c84`](https://github.com/reown-com/appkit/commit/eeb2c842018a4d6215716f64e53a045cfa206f6c), [`02a2d53`](https://github.com/reown-com/appkit/commit/02a2d53a87922c22f32c70c2a73b6b7a809f237c), [`681557f`](https://github.com/reown-com/appkit/commit/681557fe5d29c7bf13c2e2d9c81d0d72b68bd509), [`475e422`](https://github.com/reown-com/appkit/commit/475e422a1c02b85d5a314851aea56795e341ea7a), [`7e6dfcd`](https://github.com/reown-com/appkit/commit/7e6dfcd77cded48cc3d1b004a37eba6464309d71), [`4f79747`](https://github.com/reown-com/appkit/commit/4f79747373b65c020dcca7c7ac671dc1d31aa5f1), [`093f24c`](https://github.com/reown-com/appkit/commit/093f24c69632aaeeb8ffe3120fadb6a65952ff3b), [`ffb8188`](https://github.com/reown-com/appkit/commit/ffb81887a0ce663ce55973118aeb2e7368ab284a), [`d59d1dc`](https://github.com/reown-com/appkit/commit/d59d1dcb0cec891dc20f531fbcd0b08eba77c9e2)]:
  - @reown/appkit-controllers@1.7.1
  - @reown/appkit-common@1.7.1
  - @reown/appkit-polyfills@1.7.1
  - @reown/appkit-wallet@1.7.1

## 1.7.0

### Minor Changes

- [#3976](https://github.com/reown-com/appkit/pull/3976) [`cbd929f`](https://github.com/reown-com/appkit/commit/cbd929f839ad7ee4c7838fa980bcfd63b40b1415) Thanks [@tomiir](https://github.com/tomiir)! - Adds @reown/appkit-controllers. Proxies @reown/appkit-core to the new controllers package to maintain backwards compatibility.

### Patch Changes

- [#4002](https://github.com/reown-com/appkit/pull/4002) [`4fb30b0`](https://github.com/reown-com/appkit/commit/4fb30b06af2fcca0cffdae80f7ece7a9b498df4e) Thanks [@magiziz](https://github.com/magiziz)! - Updated the CDN package to identify as "cdn" instead of "html" in event tracking

- [#3952](https://github.com/reown-com/appkit/pull/3952) [`8b0f958`](https://github.com/reown-com/appkit/commit/8b0f958b8e4169564a1c77da33a1c9d15554094c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes profile name syncing when switching to non EVM network or to a testnet

- [#3998](https://github.com/reown-com/appkit/pull/3998) [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a) Thanks [@tomiir](https://github.com/tomiir)! - Removes balance fetch on account sync for core

- [#3961](https://github.com/reown-com/appkit/pull/3961) [`7280345`](https://github.com/reown-com/appkit/commit/7280345ecb39359c9a5271f0ff9ebfb902379272) Thanks [@tomiir](https://github.com/tomiir)! - Adds UX by reown footer to connection screens

- [#3985](https://github.com/reown-com/appkit/pull/3985) [`569aa92`](https://github.com/reown-com/appkit/commit/569aa92cddfe51aa93c2ca201eeb500da28e8a1a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where users could not use the embedded wallet if they denied access to their email address and/or username

- [#3860](https://github.com/reown-com/appkit/pull/3860) [`dc6c6ab`](https://github.com/reown-com/appkit/commit/dc6c6abb30fb4cbc9b7241cb8af6e6f970e71f62) Thanks [@tomiir](https://github.com/tomiir)! - Initializes Solana connection on adapter construction

- [#3969](https://github.com/reown-com/appkit/pull/3969) [`42e0f0e`](https://github.com/reown-com/appkit/commit/42e0f0ed9e0ef87cd5eae641dfb8bc8d267e1b44) Thanks [@magiziz](https://github.com/magiziz)! - Added `appKit.getAccount` public method

- [#3757](https://github.com/reown-com/appkit/pull/3757) [`95980b9`](https://github.com/reown-com/appkit/commit/95980b955955e9e50336e91789d9838a53534558) Thanks [@tomiir](https://github.com/tomiir)! - Splits code into basic and regular appkit. Re-exports ui and scaffold components so they can be tree-shaken. Dynamically import appropiate chunks according to feature flags'

- [#3998](https://github.com/reown-com/appkit/pull/3998) [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a) Thanks [@tomiir](https://github.com/tomiir)! - Removes identity calls from core account sync

- [#3916](https://github.com/reown-com/appkit/pull/3916) [`29779a4`](https://github.com/reown-com/appkit/commit/29779a491e2ef38e5e945afcf79601cede6d1219) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connection status was incorrectly set on page refresh after attempting to connect with WalletConnect.

- [#3987](https://github.com/reown-com/appkit/pull/3987) [`ce9e3c1`](https://github.com/reown-com/appkit/commit/ce9e3c1baa0189c843359ab46aa3fa0ed8f18d14) Thanks [@enesozturk](https://github.com/enesozturk)! - Handles namespace switching when calling `open()` function. Passing `namespace` to `open()` function, AppKit will switch to that namespace. If namespace is connected, it'll open Account button, if not it'll open Connect screen.

  **Example:**

  ```jsx
  const { open } = useAppKit()

  open({ namespace: 'eip155' })
  ```

  This could be combined with `view` parameter as well. It'll switch to that namespace and open relevant page.

  **Example:**

  ```jsx
  const { open } = useAppKit()

  open({ view: 'Connect', namespace: 'eip155' })
  ```

- [#3936](https://github.com/reown-com/appkit/pull/3936) [`df403d9`](https://github.com/reown-com/appkit/commit/df403d9cce342c7b75864ec5fa841324a647434c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds namespace parameter to AppKit buttons.

  This allows users to render namespace specific connect & account buttons. When namespace has passed, connect button opens connect page with only that namespace's connectors and account button shows only that namespace's account info.

  **Example:**

  ```js
  <appkit-button namespace="eip155" />
  <appkit-button namespace="solana" />
  <appkit-button namespace="bip122" />
  ```

- [#3999](https://github.com/reown-com/appkit/pull/3999) [`503b34f`](https://github.com/reown-com/appkit/commit/503b34f904b246c78319307d6892a694d5d40c0f) Thanks [@tomiir](https://github.com/tomiir)! - Updates @walletconnect packages to 1.19.1

- [#3970](https://github.com/reown-com/appkit/pull/3970) [`b5273b6`](https://github.com/reown-com/appkit/commit/b5273b6ca5de673f74fff01f3a1c460a9869903d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi triggered a disconnect on page refresh

- Updated dependencies [[`4fb30b0`](https://github.com/reown-com/appkit/commit/4fb30b06af2fcca0cffdae80f7ece7a9b498df4e), [`8b0f958`](https://github.com/reown-com/appkit/commit/8b0f958b8e4169564a1c77da33a1c9d15554094c), [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a), [`7280345`](https://github.com/reown-com/appkit/commit/7280345ecb39359c9a5271f0ff9ebfb902379272), [`569aa92`](https://github.com/reown-com/appkit/commit/569aa92cddfe51aa93c2ca201eeb500da28e8a1a), [`dc6c6ab`](https://github.com/reown-com/appkit/commit/dc6c6abb30fb4cbc9b7241cb8af6e6f970e71f62), [`42e0f0e`](https://github.com/reown-com/appkit/commit/42e0f0ed9e0ef87cd5eae641dfb8bc8d267e1b44), [`95980b9`](https://github.com/reown-com/appkit/commit/95980b955955e9e50336e91789d9838a53534558), [`7c9e4d6`](https://github.com/reown-com/appkit/commit/7c9e4d6c8fabd9bf45fb08fc867090bac47665d2), [`cbd929f`](https://github.com/reown-com/appkit/commit/cbd929f839ad7ee4c7838fa980bcfd63b40b1415), [`0559ce5`](https://github.com/reown-com/appkit/commit/0559ce5ba7472926c6a3ec5bb890cb00d212a63a), [`29779a4`](https://github.com/reown-com/appkit/commit/29779a491e2ef38e5e945afcf79601cede6d1219), [`ce9e3c1`](https://github.com/reown-com/appkit/commit/ce9e3c1baa0189c843359ab46aa3fa0ed8f18d14), [`df403d9`](https://github.com/reown-com/appkit/commit/df403d9cce342c7b75864ec5fa841324a647434c), [`503b34f`](https://github.com/reown-com/appkit/commit/503b34f904b246c78319307d6892a694d5d40c0f), [`b5273b6`](https://github.com/reown-com/appkit/commit/b5273b6ca5de673f74fff01f3a1c460a9869903d)]:
  - @reown/appkit-controllers@1.7.0
  - @reown/appkit-common@1.7.0
  - @reown/appkit-polyfills@1.7.0
  - @reown/appkit-wallet@1.7.0

## 1.6.9

### Patch Changes

- [#3878](https://github.com/reown-com/appkit/pull/3878) [`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where social popup window was blocked by safari

- [#3818](https://github.com/reown-com/appkit/pull/3818) [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad) Thanks [@enesozturk](https://github.com/enesozturk)! - Allows getting chain specific account data with hooks and subscribe methods

  ### Example Usage

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  const accountState = useAppKitAccount() // Returns active chain's account state
  const evmAccountState = useAppKitAccount({ chainNamespace: 'eip155' }) // Returns EVM chain's account state
  const solanaAccountState = useAppKitAccount({ chainNamespace: 'solana' }) // Returns Solana chain's account state
  const bitcoinAccountState = useAppKitAccount({ chainNamespace: 'bip122' }) // Returns Bitcoin chain's account state
  ```

- [#3764](https://github.com/reown-com/appkit/pull/3764) [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400) Thanks [@magiziz](https://github.com/magiziz)! - Deprecated api headers to use query parameters

- [#3833](https://github.com/reown-com/appkit/pull/3833) [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Set wallet to undefined after unmount of QR view

- [#3832](https://github.com/reown-com/appkit/pull/3832) [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add error message to SEND_ERROR event

- [#3864](https://github.com/reown-com/appkit/pull/3864) [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Applied a fix where we correctly clear the wallet state

- [#3895](https://github.com/reown-com/appkit/pull/3895) [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b) Thanks [@magiziz](https://github.com/magiziz)! - Add await in switchNetwork

- [#3869](https://github.com/reown-com/appkit/pull/3869) [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes defaultNetwork prop that is not being used on initialization

- [#3785](https://github.com/reown-com/appkit/pull/3785) [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58) Thanks [@magiziz](https://github.com/magiziz)! - Added support for react version 19

- [#3847](https://github.com/reown-com/appkit/pull/3847) [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where switching to an unrecognized chain in MM mobile resulted in INVALID_CHAIN error which was not parsed for wallet_addEthereumChain request

- [#3870](https://github.com/reown-com/appkit/pull/3870) [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4) Thanks [@zoruka](https://github.com/zoruka)! - Add extra metadata about connected wallet sent to cloud auth siwx

- [#3917](https://github.com/reown-com/appkit/pull/3917) [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where wagmi is not getting the correct session state

- [#3910](https://github.com/reown-com/appkit/pull/3910) [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca) Thanks [@tomiir](https://github.com/tomiir)! - Adds st and sv params to identity call on Blockchain Api

- [#3881](https://github.com/reown-com/appkit/pull/3881) [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes fetch identity call where if the network is not supported by wallet and if switched to another network

- [#3876](https://github.com/reown-com/appkit/pull/3876) [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3) Thanks [@magiziz](https://github.com/magiziz)! - Added bitcoin support for wallet buttons

- [#3868](https://github.com/reown-com/appkit/pull/3868) [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b) Thanks [@tomiir](https://github.com/tomiir)! - Sets default chain to current appkit chain on WC connections

- Updated dependencies [[`f9e66b9`](https://github.com/reown-com/appkit/commit/f9e66b94982cae004b9f2058eff1e845543a48c6), [`bf90239`](https://github.com/reown-com/appkit/commit/bf90239f89090a63d7c7eefc762471978aeceaad), [`73fbd0f`](https://github.com/reown-com/appkit/commit/73fbd0fc11aaba80f5a5054659fe6eb3b3211400), [`ff75922`](https://github.com/reown-com/appkit/commit/ff75922b49169f24d58ed2e41238a8d1d6e9164e), [`64a03e1`](https://github.com/reown-com/appkit/commit/64a03e147be917ffc630bdefb628ad303cce7b20), [`aeae09c`](https://github.com/reown-com/appkit/commit/aeae09cb4a01451cb59c639dbc50e9de13086e87), [`8d2a81f`](https://github.com/reown-com/appkit/commit/8d2a81f48875c2810c5e341ce4822635696c7b2b), [`b264e3b`](https://github.com/reown-com/appkit/commit/b264e3b940d28f903d0f83292b00f4fb66423118), [`faf3f25`](https://github.com/reown-com/appkit/commit/faf3f253541ba82da47da5b7f285da6400a0ab58), [`573bdfc`](https://github.com/reown-com/appkit/commit/573bdfcb7bc86f3385a2151d7a3e854c22804ea1), [`675d863`](https://github.com/reown-com/appkit/commit/675d86364d38e88e069d1b739683d16e4ff2ee71), [`eb510b0`](https://github.com/reown-com/appkit/commit/eb510b0901f0a115b48a555d2839a14c92eaccf4), [`bebdea0`](https://github.com/reown-com/appkit/commit/bebdea0fe73872ab8bfd9549bb1275b598c85821), [`62bb4da`](https://github.com/reown-com/appkit/commit/62bb4da13eefc1059bfc5b060f0f51b2b8892cca), [`1f319cd`](https://github.com/reown-com/appkit/commit/1f319cd5e5fb014d66725d2f9b975ec2ed08f21e), [`c2a833b`](https://github.com/reown-com/appkit/commit/c2a833b83e647bda357b6338913df42a3336fdf3), [`8e11300`](https://github.com/reown-com/appkit/commit/8e1130061ed5ad175093a8a1f4057646d30f049b)]:
  - @reown/appkit-common@1.6.9
  - @reown/appkit-core@1.6.9
  - @reown/appkit-polyfills@1.6.9
  - @reown/appkit-wallet@1.6.9

## 1.6.8

### Patch Changes

- [#3828](https://github.com/reown-com/appkit/pull/3828) [`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Wagmi, Viem and Coinbase Wallet SDK deps

- Updated dependencies [[`381b7f1`](https://github.com/reown-com/appkit/commit/381b7f16bd649556b3efe4f97368528b9296c794)]:
  - @reown/appkit-common@1.6.8
  - @reown/appkit-core@1.6.8
  - @reown/appkit-polyfills@1.6.8
  - @reown/appkit-wallet@1.6.8

## 1.6.7

### Patch Changes

- [#3820](https://github.com/reown-com/appkit/pull/3820) [`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where the modal doesn't recognize a difference between modal and wallet active network which causes issues when doing wallet actions"

- Updated dependencies [[`cc8efe9`](https://github.com/reown-com/appkit/commit/cc8efe967fa449b83e899afc23483effcc8adaf6)]:
  - @reown/appkit-core@1.6.7
  - @reown/appkit-common@1.6.7
  - @reown/appkit-polyfills@1.6.7
  - @reown/appkit-wallet@1.6.7

## 1.6.6

### Patch Changes

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors extendCaipNetwork util function to not override it if already extended

- [#3751](https://github.com/reown-com/appkit/pull/3751) [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c) Thanks [@zoruka](https://github.com/zoruka)! - Upgrade `@walletconnect/*` packages to `2.18.x`

- [#3736](https://github.com/reown-com/appkit/pull/3736) [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5) Thanks [@tomiir](https://github.com/tomiir)! - Adds address field to analytics event

- [#3776](https://github.com/reown-com/appkit/pull/3776) [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors get month by index method

- [#3787](https://github.com/reown-com/appkit/pull/3787) [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Don't render browser tabs on AppKit Core

- [#3760](https://github.com/reown-com/appkit/pull/3760) [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb) Thanks [@magiziz](https://github.com/magiziz)! - Improved wallet image loading by fetching them only when the modal is opened instead of on page load.

- [#3754](https://github.com/reown-com/appkit/pull/3754) [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes SIWE package dependency from AppKit main package

- [#3782](https://github.com/reown-com/appkit/pull/3782) [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades third party dependencies

- [#3766](https://github.com/reown-com/appkit/pull/3766) [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes subscribeAccount where it needs to listen ConnectorController changes while returning account state

- [#3746](https://github.com/reown-com/appkit/pull/3746) [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c) Thanks [@enesozturk](https://github.com/enesozturk)! - Remove ontouchstart events from buttons

- [#3768](https://github.com/reown-com/appkit/pull/3768) [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Replace bignumber for big.js

- [#3786](https://github.com/reown-com/appkit/pull/3786) [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add logic to correctly switch chains in universalAdapter

- [#3727](https://github.com/reown-com/appkit/pull/3727) [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where signing was not working when switching chains using WalletConnect with ethers/ethers5 adapters.

- [#3752](https://github.com/reown-com/appkit/pull/3752) [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors syncConnectors to dynamically import Coinbase Wallet SDK

- [#3775](https://github.com/reown-com/appkit/pull/3775) [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors Universal Link handling for Solana wallets to use explicit user action

- [#3771](https://github.com/reown-com/appkit/pull/3771) [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435) Thanks [@enesozturk](https://github.com/enesozturk)! - Filters connectors when switching to another namespace after connecting to one

- [#3724](https://github.com/reown-com/appkit/pull/3724) [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds network add/remove methods for dynamically setting networks

- [#3789](https://github.com/reown-com/appkit/pull/3789) [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit initialize function to separate initializing Pulse event and uses anonymous function for display_uri callback

- [#3798](https://github.com/reown-com/appkit/pull/3798) [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9) Thanks [@tomiir](https://github.com/tomiir)! - Re-expose rotated meld key to prevent key mismatches on onramp flows

- [#3784](https://github.com/reown-com/appkit/pull/3784) [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes add remove network function logics to prevent duplications

- [#3790](https://github.com/reown-com/appkit/pull/3790) [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829) Thanks [@tomiir](https://github.com/tomiir)! - Replaces blockchain api requests for balance with native balance requests

- Updated dependencies [[`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`59e8b17`](https://github.com/reown-com/appkit/commit/59e8b17248581e1ba1a5e67497c3354c1f0aaa0c), [`146df81`](https://github.com/reown-com/appkit/commit/146df816174ced5dfc49c49624d25db7aa07faf5), [`78c0d56`](https://github.com/reown-com/appkit/commit/78c0d5640a8d3ecbdde5b5ca8db36c223614740e), [`1027b27`](https://github.com/reown-com/appkit/commit/1027b274eb75df6cf807e735fa9e7a23f1f53c17), [`a7590da`](https://github.com/reown-com/appkit/commit/a7590da456ee0f51b7e6b50e24d36eda88cd86eb), [`5875b22`](https://github.com/reown-com/appkit/commit/5875b226c6e20258c493f3430b1160b19d72640f), [`7f46c56`](https://github.com/reown-com/appkit/commit/7f46c56f1300aa0dc84e890639773b1ad80ce2ae), [`4580387`](https://github.com/reown-com/appkit/commit/4580387122e740c4041c4c49ec752980e11dd5fa), [`171b8ae`](https://github.com/reown-com/appkit/commit/171b8ae4888afb188177e5697f5f484536def90c), [`bc278cb`](https://github.com/reown-com/appkit/commit/bc278cb20ec1451484d10fb5f3403e7d47354f40), [`d49404d`](https://github.com/reown-com/appkit/commit/d49404d210c2c1245b300c730009ad4e6770c984), [`a6f0943`](https://github.com/reown-com/appkit/commit/a6f0943945ca7291fca44f4b524fc7c128df808d), [`9ce44fe`](https://github.com/reown-com/appkit/commit/9ce44feb15f81b54b80c27b0390ad7e277e30f8e), [`e2c2d38`](https://github.com/reown-com/appkit/commit/e2c2d388dab1c2136cc998c1accebc1791eaa0ff), [`bf04326`](https://github.com/reown-com/appkit/commit/bf04326cbde01b04ea9284c168960b1337d3d435), [`5054449`](https://github.com/reown-com/appkit/commit/50544491c855d6b21cbbb162b4fc0cf5637a395c), [`84bac69`](https://github.com/reown-com/appkit/commit/84bac69eaa7e3b5ef923f85e308f7aaa33b4f471), [`9099148`](https://github.com/reown-com/appkit/commit/90991481fc25987d0a3f07902979c2c9d4e399a9), [`b4e3dfd`](https://github.com/reown-com/appkit/commit/b4e3dfd6f541b107eedd7748d134f6bea348f176), [`cad4da7`](https://github.com/reown-com/appkit/commit/cad4da7a13f9b5d97c38348b593014486fb44829)]:
  - @reown/appkit-common@1.6.6
  - @reown/appkit-core@1.6.6
  - @reown/appkit-polyfills@1.6.6
  - @reown/appkit-wallet@1.6.6

## 1.6.5

### Patch Changes

- [#3523](https://github.com/reown-com/appkit/pull/3523) [`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8) Thanks [@zoruka](https://github.com/zoruka)! - Abstracts Connectors management in Solana Adapter

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where mobile view would show auth login options without adapters

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors network switching when trying to use auth connector but active network is not supported by auth connector

- [#3589](https://github.com/reown-com/appkit/pull/3589) [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connector rendering logics when add/remove adapters for email/social login

- [#3638](https://github.com/reown-com/appkit/pull/3638) [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde) Thanks [@zoruka](https://github.com/zoruka)! - Fix condition for unsupported chain for `chainChanged` event on wallet connect event

- [#3637](https://github.com/reown-com/appkit/pull/3637) [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a) Thanks [@zoruka](https://github.com/zoruka)! - Add default value if namespace is not available on upa getAccounts

- [#3721](https://github.com/reown-com/appkit/pull/3721) [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes listening `ChainController.state.noAdapters` and `OptionsController.state.features` while enable/disable auth options dynamically

- [#3639](https://github.com/reown-com/appkit/pull/3639) [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3) Thanks [@zoruka](https://github.com/zoruka)! - Fix BitcoinAdapter `switchNetwork` function execution

- [#3621](https://github.com/reown-com/appkit/pull/3621) [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when on testnets

- [#3691](https://github.com/reown-com/appkit/pull/3691) [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc) Thanks [@magiziz](https://github.com/magiziz)! - Expanded more views in the modal open function to include Swap, Send, Wallet Is a Wallet, Wallet Is a Network and All Wallets screens.

  **Example usage**

  ```tsx
  import { createAppKit } from '@reown/appkit'

  const VIEWS = [
    { label: 'Open "On-Ramp" modal view', view: 'Swap' },
    { label: 'Open "Send" modal view', view: 'WalletSend' },
    { label: 'Open "What Is a Wallet?" modal view', view: 'WhatIsAWallet' },
    { label: 'Open "What Is a Network?" modal view', view: 'WhatIsANetwork' },
    { label: 'Open "All Wallets" modal view', view: 'AllWallets' }
  ] as const

  const modal = createAppKit({
    adapters: [], // Add your adapters here
    networks: [], // Add your networks here
    projectId: 'YOUR_PROJECT_ID'
  })

  export function YourApp() {
    return (
      <>
        {VIEWS.map(({ label, view }) => (
          <button key={view} onClick={() => modal.open({ view })}>
            {label}
          </button>
        ))}
      </>
    )
  }
  ```

- [#3648](https://github.com/reown-com/appkit/pull/3648) [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where opening the modal without adapters would open regular connect WC screen

- [#3717](https://github.com/reown-com/appkit/pull/3717) [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901) Thanks [@zoruka](https://github.com/zoruka)! - Update @walletconnect packages to latest version.

- [#3640](https://github.com/reown-com/appkit/pull/3640) [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4) Thanks [@magiziz](https://github.com/magiziz)! - Added `createAppKitWalletButton` function to `@reown/appkit-wallet-button` package for easier implementation of the Wallet Button feature without relying solely on hooks.

  **Example usage**

  ```tsx
  import { useEffect, useState } from 'react'

  import { createAppKitWalletButton } from '@reown/appkit-wallet-button'

  const appKitWalletButton = createAppKitWalletButton()

  export function YourApp() {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      // Check if Wallet Buttons are ready
      if (appKitWalletButton.isReady()) {
        setIsReady(true)
      } else {
        // Subscribe to ready state changes
        appKitWalletButton.subscribeIsReady(state => {
          setIsReady(state.isReady)
        })
      }
    }, [appKitWalletButton])

    return (
      <>
        <button onClick={() => appKitWalletButton.connect('walletConnect')} disabled={!isReady}>
          Open QR modal
        </button>
        <button onClick={() => appKitWalletButton.connect('metamask')} disabled={!isReady}>
          Connect to MetaMask
        </button>{' '}
        <button onClick={() => appKitWalletButton.connect('google')} disabled={!isReady}>
          Connect to Google
        </button>
      </>
    )
  }
  ```

- [#3681](https://github.com/reown-com/appkit/pull/3681) [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes redundant goBack call when switching to another namespace

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where appKit.getProvider() would not return correct provider.

- [#3716](https://github.com/reown-com/appkit/pull/3716) [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43) Thanks [@tomiir](https://github.com/tomiir)! - Fetches native balance when API does not support it

- [#3679](https://github.com/reown-com/appkit/pull/3679) [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors AppKit client to handle syncBalance call for unsupported networks as expected

- [#3607](https://github.com/reown-com/appkit/pull/3607) [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891) Thanks [@zoruka](https://github.com/zoruka)! - Add defaultAccountTypes option for AppKit initialization.

- [#3682](https://github.com/reown-com/appkit/pull/3682) [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760) Thanks [@tomiir](https://github.com/tomiir)! - Prevents calls to Blockchain Api that would fail due to lack of support. Initialize supported list on AppKit initialization'

- [#3576](https://github.com/reown-com/appkit/pull/3576) [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d) Thanks [@magiziz](https://github.com/magiziz)! - Added a loading indicator to the account button component when the balance has not been fetched.

- [#3635](https://github.com/reown-com/appkit/pull/3635) [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connectExternal to call switch network if wallet's active chain is not in requested networks list

- [#3663](https://github.com/reown-com/appkit/pull/3663) [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9) Thanks [@zoruka](https://github.com/zoruka)! - Remove all onUri callback drilling for all walletConnectConnect methods in favor of a single call when initializing the UniversalProvider

- [#3672](https://github.com/reown-com/appkit/pull/3672) [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where `walletProvider` from the `useAppKitProvider` hook was `undefined` when the wallet was connected. This issue occurred only when using wagmi adapter.

- [#3670](https://github.com/reown-com/appkit/pull/3670) [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where 1CA session would not be found because of non-cased addresses mismatching.'

- [#3715](https://github.com/reown-com/appkit/pull/3715) [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi connectors were not appearing in the connect modal

- [#3619](https://github.com/reown-com/appkit/pull/3619) [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842) Thanks [@zoruka](https://github.com/zoruka)! - Refactor to add WalletConnectConnector as extensible class and remove replicated code around adapters

- [#3678](https://github.com/reown-com/appkit/pull/3678) [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46) Thanks [@tomiir](https://github.com/tomiir)! - Removes duplicated all wallets button on AppKit Core

- [#3680](https://github.com/reown-com/appkit/pull/3680) [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where onramp and activity were enabled in non-supported networks'

- [#3692](https://github.com/reown-com/appkit/pull/3692) [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b) Thanks [@magiziz](https://github.com/magiziz)! - Added an alert error if the analytics event fails with a forbidden status.

- [#3611](https://github.com/reown-com/appkit/pull/3611) [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac) Thanks [@tomiir](https://github.com/tomiir)! - Adds authProvider to embeddedWalletInfo in useAppKitAccount

- [#3714](https://github.com/reown-com/appkit/pull/3714) [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi adapter would emit disconnect event when user was not connected causing SIWE to break.

- [#3723](https://github.com/reown-com/appkit/pull/3723) [`a90474b`](https://github.com/reown-com/appkit/commit/a90474bec8d791d27dc0bec542f57193945b9e63) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where multichain social/email login was not working

- Updated dependencies [[`427dde3`](https://github.com/reown-com/appkit/commit/427dde3cfb3bcb8a61d22b3732150c39958483e8), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`6932fbf`](https://github.com/reown-com/appkit/commit/6932fbf81d5e3e8bfbc67476c9cc521bb014be6a), [`86e7510`](https://github.com/reown-com/appkit/commit/86e75103084d6babdb0d0bb8afbbe30199fb3dde), [`40ef5c7`](https://github.com/reown-com/appkit/commit/40ef5c7b35e48a2271c27ae770b93061fa216d8a), [`eade9f2`](https://github.com/reown-com/appkit/commit/eade9f28e41b608db0237be526d65742cf13e991), [`489de7c`](https://github.com/reown-com/appkit/commit/489de7c77be40d8131b721d81cf89241fe5348b3), [`7b4f03f`](https://github.com/reown-com/appkit/commit/7b4f03f24d853a514d26f5d6dcc1c2255c3573b3), [`4075214`](https://github.com/reown-com/appkit/commit/4075214027e183c04b29758628b2fca81a25b5dc), [`225aba4`](https://github.com/reown-com/appkit/commit/225aba4f3839f34f5a838650d594ed9ec23e2e3f), [`72b14ce`](https://github.com/reown-com/appkit/commit/72b14ce20fdde3b0162e496756fdd96ac14ab901), [`2935978`](https://github.com/reown-com/appkit/commit/293597872b31eecf7c4d04e0f875688f6c795af4), [`20c608f`](https://github.com/reown-com/appkit/commit/20c608f30aef7df58b4da1bfb9d57967bfd0e46c), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`59f57f3`](https://github.com/reown-com/appkit/commit/59f57f356cd9887ce87e5877ec7561656eb32e43), [`3305586`](https://github.com/reown-com/appkit/commit/3305586614d73fe9a3b71919c2b29c3b1568826b), [`a66de04`](https://github.com/reown-com/appkit/commit/a66de0442e6d421e8d0dcf875573ee49071bf891), [`1ea9f7d`](https://github.com/reown-com/appkit/commit/1ea9f7d0b8a138376a10de7287cf0ed2254a7760), [`68bdd14`](https://github.com/reown-com/appkit/commit/68bdd1476b85b0d47d70ef2fe35bf8c6eba3c74d), [`190fdb9`](https://github.com/reown-com/appkit/commit/190fdb9c6f5563df2095e808bbdffac1ae73aed6), [`018c6f1`](https://github.com/reown-com/appkit/commit/018c6f1e87f4b5e0c14aff8c45b5713809defcc9), [`98ad777`](https://github.com/reown-com/appkit/commit/98ad777c5de798ae549ad4bac10b6ced7cda18b1), [`25a97c6`](https://github.com/reown-com/appkit/commit/25a97c66fe47c2c1d19cf8bbf5c5474612cd6e7b), [`3accd43`](https://github.com/reown-com/appkit/commit/3accd437e21dcb9316cbe83e0bf9a8a3268ab7ce), [`7296a32`](https://github.com/reown-com/appkit/commit/7296a32b99bac546ab84555ca6a71b8838b61842), [`1614ff6`](https://github.com/reown-com/appkit/commit/1614ff603d09fbfc9c2d70fc9a7c8cff33b98b46), [`62b4369`](https://github.com/reown-com/appkit/commit/62b4369ade281bdd5bcb90791817283e20c678cc), [`5472c34`](https://github.com/reown-com/appkit/commit/5472c34fd3ad4328d8de347c65801718ff970d3b), [`6431f0c`](https://github.com/reown-com/appkit/commit/6431f0cc99194c06eb93c3bc0ba7525b5b2c04ac), [`83d62d9`](https://github.com/reown-com/appkit/commit/83d62d98148fb5130a1698fdfa974db26cea66dc)]:
  - @reown/appkit-common@1.6.5
  - @reown/appkit-core@1.6.5
  - @reown/appkit-polyfills@1.6.5
  - @reown/appkit-wallet@1.6.5

## 1.6.4

### Patch Changes

- [#3579](https://github.com/reown-com/appkit/pull/3579) [`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87) Thanks [@magiziz](https://github.com/magiziz)! - Added an error message for when the user provides an invalid project id.

- [#3562](https://github.com/reown-com/appkit/pull/3562) [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a) Thanks [@tomiir](https://github.com/tomiir)! - Sets secure site version to 3.
  Handles case where Magic SDK connection fizzled, causing magic to connected while AppKit believed it was not connected

- [#3564](https://github.com/reown-com/appkit/pull/3564) [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the balance endpoint was being called every 30 seconds for unsupported networks.

- [#3575](https://github.com/reown-com/appkit/pull/3575) [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2) Thanks [@enesozturk](https://github.com/enesozturk)! - Exposes publicKey and path for bitcoin connectors in allAccounts

- [#3596](https://github.com/reown-com/appkit/pull/3596) [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds client check for the methods in bitcoin connectors for ssr issues

- [#3560](https://github.com/reown-com/appkit/pull/3560) [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where closing the modal mid embedded wallet request would not abort the request

- [#3568](https://github.com/reown-com/appkit/pull/3568) [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where only wallets from the initially active chain ID would be fetched. Re-fetches wallets from API when network changes.

- [#3563](https://github.com/reown-com/appkit/pull/3563) [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the modal didn't close after completing login if users navigated between different social login options.

- [#3583](https://github.com/reown-com/appkit/pull/3583) [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where swap button shows an infinite spinner

- [#3573](https://github.com/reown-com/appkit/pull/3573) [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b) Thanks [@magiziz](https://github.com/magiziz)! - Added a new `required` option to SIWE/SIWX. This option determines whether the wallet stays connected when the user denies the signature request. If set to `true` it will disconnect the wallet and close the modal. If set to `false` it will close the modal without disconnecting the wallet.

  **Example usage**

  ```ts
  import { createSIWEConfig } from '@reown/appkit-siwe'
  import type { SIWECreateMessageArgs, SIWEVerifyMessageArgs } from '@reown/appkit-siwe'

  export const siweConfig = createSIWEConfig({
    required: false, // Optional - defaults to true
    getMessageParams: async () => {
      // Return message parameters
    },
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => {
      // Return formatted message
    },
    getNonce: async () => {
      // Return nonce
    },
    getSession: async () => {
      // Return session
    },
    verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
      // Verify message
    },
    signOut: async () => {
      // Sign out
    }
  })
  ```

- [#3586](https://github.com/reown-com/appkit/pull/3586) [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds add/remove adapter methods to appkit client, moves active connector state to connected connector

- [#3565](https://github.com/reown-com/appkit/pull/3565) [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where users with an ENS couldn't copy their address.

- [#3590](https://github.com/reown-com/appkit/pull/3590) [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi did not reconnect on page reload

- [#3584](https://github.com/reown-com/appkit/pull/3584) [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where status would not be set for non-connected namespaces. Make syncExistingConnection call syncNamespaceConnection for non-connected namespaces as well, resulting in status being set correctly'

- [#3554](https://github.com/reown-com/appkit/pull/3554) [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix farcaster issue, so user can see their correct username in account view

- [#3555](https://github.com/reown-com/appkit/pull/3555) [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - add create subscription method

- [#3558](https://github.com/reown-com/appkit/pull/3558) [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd) Thanks [@magiziz](https://github.com/magiziz)! - Added embedded wallet info to `useAppKitAccount` hook.

  **Example usage**

  ```tsx
  import { useAppKitAccount } from '@reown/appkit/react'

  export function YourApp() {
    const { embeddedWalletInfo } = useAppKitAccount()

    const email = embeddedWalletInfo.user?.email

    return email && <p>Email address: {email}</p>
  }
  ```

- [#3592](https://github.com/reown-com/appkit/pull/3592) [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3) Thanks [@tomiir](https://github.com/tomiir)! - Fixed issue where balance would not be properly synced due to not finding correct chainId or pointing to other tokens in portfolio instead of native token

- Updated dependencies [[`8ddfbf2`](https://github.com/reown-com/appkit/commit/8ddfbf227ba8bc39c7b4071c328568e9ab365b87), [`fbafcea`](https://github.com/reown-com/appkit/commit/fbafcea4038d0644fd9c84e05a15990b11707b9a), [`6284eb1`](https://github.com/reown-com/appkit/commit/6284eb190de3eda2fcf04848f0fb10aee7921b13), [`37901c6`](https://github.com/reown-com/appkit/commit/37901c6d6fa64108a8c40a99fc7973e8b8f0d4b2), [`150cdb6`](https://github.com/reown-com/appkit/commit/150cdb6ebc7f4befd56fc6438ce57f09a887096f), [`83635a4`](https://github.com/reown-com/appkit/commit/83635a42c57896580ba69aeffd527481868047b0), [`87029c0`](https://github.com/reown-com/appkit/commit/87029c0662567dd658f0e204a07eb67f08e3c813), [`35a4f56`](https://github.com/reown-com/appkit/commit/35a4f564ef273b7840e8148d286755a587bb04b8), [`34ed47e`](https://github.com/reown-com/appkit/commit/34ed47e9542b183463777caf096fd44ea8eb0816), [`d9a96a5`](https://github.com/reown-com/appkit/commit/d9a96a5bfd8e358e73c8b4cfb9efb09efcbe8f1b), [`d5b811c`](https://github.com/reown-com/appkit/commit/d5b811c666e41846fd5798116e7c93606b4b992f), [`93cee5c`](https://github.com/reown-com/appkit/commit/93cee5c44e6f30f3594bc7c5a4029dc1f05503f1), [`56d82e8`](https://github.com/reown-com/appkit/commit/56d82e8b04fb49d586f65f6e20fdd788e83000d5), [`7703d40`](https://github.com/reown-com/appkit/commit/7703d409b6107c7fd61228fc1f1576d1b8503ce5), [`7a7df99`](https://github.com/reown-com/appkit/commit/7a7df99625721759f2b426e6d8c3d1b13749a2cb), [`3ee19a2`](https://github.com/reown-com/appkit/commit/3ee19a227540bb496aa1b319d64f0306a82ce5dd), [`a48e2f9`](https://github.com/reown-com/appkit/commit/a48e2f9067bdbe85b87ff1d720cb898dbc0ed3cd), [`14d6281`](https://github.com/reown-com/appkit/commit/14d62819e178e8ccf9f76c3a0c5fb16e21db52e3)]:
  - @reown/appkit-common@1.6.4
  - @reown/appkit-core@1.6.4
  - @reown/appkit-polyfills@1.6.4
  - @reown/appkit-wallet@1.6.4

## 1.6.3

### Patch Changes

- [`3db8487`](https://github.com/reown-com/appkit/commit/295f320b133b5bd605f9c9a89441935a2471f1ec) Thanks [@magiziz](https://github.com/magiziz)! - Updated account modal to redirect to the settings view instead of the profile view when only one social/email account is connected

- [`3db8487`](https://github.com/reown-com/appkit/commit/a3dae620d7f5209ca496ada6491eced3f0e5391c) Thanks [@magiziz](https://github.com/magiziz)! - Added a new option to enable or disable logs from email/social login.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    adapters: [
      /* Adapters */
    ],
    networks: [
      /* Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    enableAuthLogger: false // Optional - defaults to true
  })
  ```

- [`3db8487`](https://github.com/reown-com/appkit/commit/8569d56a3c6ab41833c7ef6a21712afee4bbcec0) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where non-embedded wallets would show an empty list on send flow

- [`3db8487`](https://github.com/reown-com/appkit/commit/39616f5efb6f5af17ef716aca2383597cd98fdde) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes `signOutOnNetworkChange` and `signOutOnAccountChange` flags on SIWX mapper function to work as expected

- [`3db8487`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue with WC connections on wallets that do not support a requested network. Sets default network to first one supported by wallet

- [`3db8487`](https://github.com/reown-com/appkit/commit/0735f15c65b5de397dd856004f197f2ec07538f9) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would be undefined or empty

- [`3db8487`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Improves existing connection error handling'

- [`3db8487`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where disconnecting the injected wallet did not update the state as disconnected for ethers/ethers5 adapters

- [`3db8487`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed) Thanks [@tomiir](https://github.com/tomiir)! - Adds loading while disconnecting

- [`3db8487`](https://github.com/reown-com/appkit/commit/e6fc9800039984e3150c38a4c4cbd7214d07742c) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where refreshing the page when connected to multiple namespaces would only reconnect the last active one

- [`3db8487`](https://github.com/reown-com/appkit/commit/d3ecccbbde0d40a27f2b261a3d99b15ab83149da) Thanks [@tomiir](https://github.com/tomiir)! - Prevents blockchain api calls on testnets

- [`3db8487`](https://github.com/reown-com/appkit/commit/7e19daeaf93c48338f1f7b5dc5de5a271ae8f643) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Vue hooks to return reactive values

- [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - fix reload iframe after aborting farcaster

- [`3db8487`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where an incorrect EOA label and icon were displayed in the profile view after reconnecting through social/email login

- [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c) Thanks [@zoruka](https://github.com/zoruka)! - Set connected wallet info when going to authenticate flow.

- [`3db8487`](https://github.com/reown-com/appkit/commit/4d25c1d7986a2b9b0128d3c250e750c60b619cc0) Thanks [@tomiir](https://github.com/tomiir)! - Updates @solana/web3.js dependency to latest

- [`3db8487`](https://github.com/reown-com/appkit/commit/7459461eed6786a17c251c40aab153572ecda45f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where profile name and profile image was not displayed after connecting via social or email login

- Updated dependencies [[`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`f045fb5`](https://github.com/reown-com/appkit/commit/f045fb5c4703f1661d1701ce898945acd73a97f9), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c), [`3db8487`](https://github.com/reown-com/appkit/commit/3db8487122ab6b52e14db8ce639cd7ea92ac4f5c)]:
  - @reown/appkit-common@1.6.3
  - @reown/appkit-core@1.6.3
  - @reown/appkit-polyfills@1.6.3
  - @reown/appkit-wallet@1.6.3

## 1.6.2

### Patch Changes

- [#3491](https://github.com/reown-com/appkit/pull/3491) [`0a8ead2`](https://github.com/reown-com/appkit/commit/0a8ead262ee0a2e0c116b1eaeb80fd5086d0298f) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where browser tab option was showing for all wallets

- [#3509](https://github.com/reown-com/appkit/pull/3509) [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where accounts were not correctly set

- [#3516](https://github.com/reown-com/appkit/pull/3516) [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728) Thanks [@zoruka](https://github.com/zoruka)! - Add unit testing for Bitcoin adapter and fix unused default values

- [#3514](https://github.com/reown-com/appkit/pull/3514) [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `pendingTransactions` event was being emitted infinitely in wagmi adapter.

  Additionally another option was added to wagmi adapter called `pendingTransactionsFilter`.

  **Example usage**

  ```ts
  const wagmiAdapter = new WagmiAdapter({
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID',
    pendingTransactionsFilter: {
      enable: true,
      pollingInterval: 15_000
    }
  })

  createAppKit({
    adapters: [wagmiAdapter],
    networks: [
      /* Your Networks */
    ],
    projectId: 'YOUR_PROJECT_ID'
  })
  ```

- Updated dependencies [[`0a8ead2`](https://github.com/reown-com/appkit/commit/0a8ead262ee0a2e0c116b1eaeb80fd5086d0298f), [`0926b4d`](https://github.com/reown-com/appkit/commit/0926b4d7286ce82d58e2acd85b108f69c8823867), [`04208c8`](https://github.com/reown-com/appkit/commit/04208c86b4b2ce6621561b121a8a620687a58728), [`15bfe49`](https://github.com/reown-com/appkit/commit/15bfe4963087e3002df989f497a18a7d126c8c72)]:
  - @reown/appkit-common@1.6.2
  - @reown/appkit-core@1.6.2
  - @reown/appkit-polyfills@1.6.2
  - @reown/appkit-wallet@1.6.2

## 1.6.1

### Patch Changes

- [#3503](https://github.com/reown-com/appkit/pull/3503) [`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759) Thanks [@zoruka](https://github.com/zoruka)! - Set active chain as first chain when calling authenticate on universal provider

- [#3465](https://github.com/reown-com/appkit/pull/3465) [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120) Thanks [@enesozturk](https://github.com/enesozturk)! - refactor: adds background transition

- [#3456](https://github.com/reown-com/appkit/pull/3456) [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144) Thanks [@zoruka](https://github.com/zoruka)! - Add Bitcoin network image id

- [#3455](https://github.com/reown-com/appkit/pull/3455) [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220) Thanks [@zoruka](https://github.com/zoruka)! - Add icon with copy function on Bitcoin account view

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connectors did not remain connected after page refresh despite being connected previously

- [#3447](https://github.com/reown-com/appkit/pull/3447) [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix allowUnsupportedChain param to work correctly

- [#3177](https://github.com/reown-com/appkit/pull/3177) [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Adds walletConnectProvider flag to inject a UniversalProvider instance to be used by AppKit'

- [#3501](https://github.com/reown-com/appkit/pull/3501) [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468) Thanks [@Cali93](https://github.com/Cali93)! - Fix logic for authentication header on CloudAuthSIWX

- [#3461](https://github.com/reown-com/appkit/pull/3461) [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where approving with Smart Account didn't work

- [#3449](https://github.com/reown-com/appkit/pull/3449) [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrade dependency versions

- [#3460](https://github.com/reown-com/appkit/pull/3460) [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors disconnect business logic for multiple adapter use cases

- [#3485](https://github.com/reown-com/appkit/pull/3485) [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors connect view's mask image styling with resize observer for dynamic masking

- [#3476](https://github.com/reown-com/appkit/pull/3476) [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01) Thanks [@zoruka](https://github.com/zoruka)! - Add jsdocs comments explaining params and functions from SIWX and Bitcoin packages.

- [#3505](https://github.com/reown-com/appkit/pull/3505) [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d) Thanks [@tomiir](https://github.com/tomiir)! - Makes bitcoin adapter public

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Coinbase Wallet wasn't working on iOS safari

- [#3471](https://github.com/reown-com/appkit/pull/3471) [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2) Thanks [@zoruka](https://github.com/zoruka)! - Clear SIWX sessions when calling ConnectionController.disconnect

- [#3482](https://github.com/reown-com/appkit/pull/3482) [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc) Thanks [@enesozturk](https://github.com/enesozturk)! - Expose a public function to get connect method order with AppKit instance

- [#3499](https://github.com/reown-com/appkit/pull/3499) [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Improve send flow UX with better error handling

- [#3466](https://github.com/reown-com/appkit/pull/3466) [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9) Thanks [@enesozturk](https://github.com/enesozturk)! - refactor: make the wallet image listen state updates for embedded use case

- [#3454](https://github.com/reown-com/appkit/pull/3454) [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796) Thanks [@zoruka](https://github.com/zoruka)! - Filter out duplicated addresses from WalletStandardConnector on Bitcoin adapter

- [#3462](https://github.com/reown-com/appkit/pull/3462) [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781) Thanks [@zoruka](https://github.com/zoruka)! - Adds parsing of Universal Provider session_event to get accountsChanged event

- [#3489](https://github.com/reown-com/appkit/pull/3489) [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where connector id from Local Storage wasn't in sync

- [#3450](https://github.com/reown-com/appkit/pull/3450) [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d) Thanks [@zoruka](https://github.com/zoruka)! - Fix the chainId response when connecting to bitcoin with multichain adapters

- [#3502](https://github.com/reown-com/appkit/pull/3502) [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where undefined address would throw an error polluting logs

- [#3484](https://github.com/reown-com/appkit/pull/3484) [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where adapters and connectors were not synchronized

- [#3504](https://github.com/reown-com/appkit/pull/3504) [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where wagmi connector won't disconnect

- [#3446](https://github.com/reown-com/appkit/pull/3446) [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036) Thanks [@enesozturk](https://github.com/enesozturk)! - Filter out when there is duplicate wallet items in recents and injected wallets

- Updated dependencies [[`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759), [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120), [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144), [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c), [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771), [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468), [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678), [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58), [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5), [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31), [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01), [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2), [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc), [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871), [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9), [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796), [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781), [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8), [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d), [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde), [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036)]:
  - @reown/appkit-core@1.6.1
  - @reown/appkit-common@1.6.1
  - @reown/appkit-polyfills@1.6.1
  - @reown/appkit-wallet@1.6.1

## 1.6.0

### Minor Changes

- [#3425](https://github.com/reown-com/appkit/pull/3425) [`b5e2dfa`](https://github.com/reown-com/appkit/commit/b5e2dfab8a3cd96db3e30b5bcaf1478a3d55cb2d) Thanks [@zoruka](https://github.com/zoruka)! - Add CloudAuthSIWX configuration

### Patch Changes

- [#3375](https://github.com/reown-com/appkit/pull/3375) [`26e9f12`](https://github.com/reown-com/appkit/commit/26e9f12aef1d5e32f7814be189de5d405903b378) Thanks [@magiziz](https://github.com/magiziz)! - Removed upgrade to smart account screen

- [#3429](https://github.com/reown-com/appkit/pull/3429) [`388e6d6`](https://github.com/reown-com/appkit/commit/388e6d676ffd0bd76d4973b7f3e2c90c459daafb) Thanks [@magiziz](https://github.com/magiziz)! - Debug mode is now set to true by default. Additionally fixed an issue where alerts and console errors were not working in debug mode.

- [#3341](https://github.com/reown-com/appkit/pull/3341) [`548962c`](https://github.com/reown-com/appkit/commit/548962c710dd973da2128c415bb2beaea044751f) Thanks [@magiziz](https://github.com/magiziz)! - Edited wallet guide text

- [#3404](https://github.com/reown-com/appkit/pull/3404) [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where setEIP6963Enabled is not getting called

- [#3382](https://github.com/reown-com/appkit/pull/3382) [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix subscribeProviders method in AppKit client

- [#3376](https://github.com/reown-com/appkit/pull/3376) [`69f9469`](https://github.com/reown-com/appkit/commit/69f94693357bcf2dbffc8aa4c81aa0c0a592fc1f) Thanks [@zoruka](https://github.com/zoruka)! - Fix BIP122Verifier replacing the library used for one with a wider range of signature verifiations

- [#3437](https://github.com/reown-com/appkit/pull/3437) [`4d2ddad`](https://github.com/reown-com/appkit/commit/4d2ddad12979a1f79b3c28c9c69d44aad6c9b013) Thanks [@zoruka](https://github.com/zoruka)! - Fixes the Solana wallets not being recognized as installed in the all wallets list

- [#3371](https://github.com/reown-com/appkit/pull/3371) [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds separate event for swap approval process

- [#3350](https://github.com/reown-com/appkit/pull/3350) [`0c55e65`](https://github.com/reown-com/appkit/commit/0c55e6576da71a7aa5922a02ff489184bf65c026) Thanks [@zoruka](https://github.com/zoruka)! - Add SIWX BIP122Verifier

- [#3419](https://github.com/reown-com/appkit/pull/3419) [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes state and storage syncronization and persisting on multiple adapter instances

- [#3392](https://github.com/reown-com/appkit/pull/3392) [`1021422`](https://github.com/reown-com/appkit/commit/1021422c157b3a8a4d90edcd40f435adac21d119) Thanks [@tomiir](https://github.com/tomiir)! - Only syncs identity on address updates

- [#3363](https://github.com/reown-com/appkit/pull/3363) [`7236c86`](https://github.com/reown-com/appkit/commit/7236c866986a9bf218963542e445de27b86ab7f0) Thanks [@zoruka](https://github.com/zoruka)! - Adds SatsConnectConnector wallet events biding with AppKit and LeatherConnector

- [#3408](https://github.com/reown-com/appkit/pull/3408) [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b) Thanks [@zoruka](https://github.com/zoruka)! - Add Bitcoin OKX Wallet connector

- [#3432](https://github.com/reown-com/appkit/pull/3432) [`9fce094`](https://github.com/reown-com/appkit/commit/9fce0941613fa98896d3a0537f7f73b5763d3a07) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes phantom and coinbase deeplink url parameters to be encoded

- [#3417](https://github.com/reown-com/appkit/pull/3417) [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Solana Connection was not being set on WC Relay wallets, causing transactions to fail.

- [#3401](https://github.com/reown-com/appkit/pull/3401) [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d) Thanks [@zoruka](https://github.com/zoruka)! - Add BitcoinAdapter.getBalance implementation based on BitcoinApi

- [#3397](https://github.com/reown-com/appkit/pull/3397) [`ca659e7`](https://github.com/reown-com/appkit/commit/ca659e71e38cfa137b73b12a42e99cbcf99ff02a) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Add farcaster events

- [#3390](https://github.com/reown-com/appkit/pull/3390) [`4c9410a`](https://github.com/reown-com/appkit/commit/4c9410a76a932b83115f7eec043ff88aab38f7e0) Thanks [@tomiir](https://github.com/tomiir)! - Uses default chain rpc url for wallet_addEthereumChain requests on ethers

- [#3400](https://github.com/reown-com/appkit/pull/3400) [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors some ui rendering logics and enables setting extra configurations via modal functions

- [#3387](https://github.com/reown-com/appkit/pull/3387) [`8f1ce50`](https://github.com/reown-com/appkit/commit/8f1ce503548c1218d5d13f174341a0742aa2d22e) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades solana/web3.js package version

- [#3403](https://github.com/reown-com/appkit/pull/3403) [`d4352b0`](https://github.com/reown-com/appkit/commit/d4352b01aa71f6fce8f67ec50225f51250b0bfc8) Thanks [@lukaisailovic](https://github.com/lukaisailovic)! - iframe deeplink fix

- [#3420](https://github.com/reown-com/appkit/pull/3420) [`d07a72b`](https://github.com/reown-com/appkit/commit/d07a72bb6397bb4580b9999bdbe927817d5b015e) Thanks [@magiziz](https://github.com/magiziz)! - Added `enableWalletGuide` option to allow disabling the wallet guide footer when social or email logins are enabled.

  **Example usage**

  ```ts
  import { createAppKit } from '@reown/appkit'

  const modal = createAppKit({
    adapters: [
      /* Adapters */
    ],
    networks: [
      /* Networks */
    ],
    projectId: 'YOUR_RPOJECT_ID',
    enableWalletGuide: false // Optional - defaults to true
  })
  ```

- [#3434](https://github.com/reown-com/appkit/pull/3434) [`2a7a963`](https://github.com/reown-com/appkit/commit/2a7a963accb966a42c206fefebd1c9f78b358215) Thanks [@enesozturk](https://github.com/enesozturk)! - Hides the go back button on header when embedded mode is enabled

- [#3421](https://github.com/reown-com/appkit/pull/3421) [`50c619a`](https://github.com/reown-com/appkit/commit/50c619aacfbcf34952d78465a597bcbf59d9bdf8) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Return custom RPC when configured in wagmi config

- [#3415](https://github.com/reown-com/appkit/pull/3415) [`9e1e4c9`](https://github.com/reown-com/appkit/commit/9e1e4c9ac565c2164750f178b6d896e57d3b68e5) Thanks [@magiziz](https://github.com/magiziz)! - Introduced wallet button component and custom hook for headless integration.

  Components example:

  ```tsx
  import '@reown/appkit-wallet-button'

  export function YourApp() {
    return (
      <>
        {/* QR Code (WalletConnect) */}
        <appkit-wallet-button wallet="walletConnect" />

        {/* Wallets */}
        <appkit-wallet-button wallet="metamask" />
        <appkit-wallet-button wallet="trust" />
        <appkit-wallet-button wallet="coinbase" />

        {/* Socials */}
        <appkit-wallet-button wallet="google" />
        <appkit-wallet-button wallet="x" />
        <appkit-wallet-button wallet="discord" />
        <appkit-wallet-button wallet="farcaster" />
      </>
    )
  }
  ```

  Hook example:

  ```tsx
  import { useAppKitWallet } from '@reown/appkit-wallet-button/react'

  export function YourApp() {
    const { data, error, isPending, isSuccess, isError, connect } = useAppKitWallet({
      onError: err => {
        // ...
      },
      onSuccess: data => {
        // ...
      }
    })

    return (
      <>
        <button onClick={() => connect('walletConnect')}>Open QR modal</button>
        <button onClick={() => connect('metamask')}>Connect to MetaMask</button>
        <button onClick={() => connect('google')}>Connect to Google</button>
      </>
    )
  }
  ```

  Additionally a new theme variable property called `--w3m-qr-color` was added where you can configure a custom color for the QR code.

  ```tsx
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    /* Your Config */
    themeVariables: {
      '--w3m-qr-color': '...', // Optional
      '--w3m-color-mix': '...',
      '--w3m-color-mix-strength': 50
    }
  })
  ```

- [#3382](https://github.com/reown-com/appkit/pull/3382) [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - feat: Fetch balance of specific adapter after a transactions has been made

- [#3381](https://github.com/reown-com/appkit/pull/3381) [`48b9054`](https://github.com/reown-com/appkit/commit/48b90547f06c40a9030c0ea6d869d94237a1053d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the Solana adapter would continue to return `walletProvider.publicKey` from the `useAppKitProvider` hook even after disconnection.

- [#3439](https://github.com/reown-com/appkit/pull/3439) [`3e9758e`](https://github.com/reown-com/appkit/commit/3e9758e18b1fb9d3b08546901bbd33fab4f40827) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where wagmi connectors are unable to restore a session

- [#3443](https://github.com/reown-com/appkit/pull/3443) [`53ecc19`](https://github.com/reown-com/appkit/commit/53ecc19bb15f257dfd4afa34c855dd3a0620d4f9) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where pending transaction listener was causing infinite request.

- [#3377](https://github.com/reown-com/appkit/pull/3377) [`76acc12`](https://github.com/reown-com/appkit/commit/76acc1288879884443d71e798f33b81aee1e2945) Thanks [@zoruka](https://github.com/zoruka)! - Refine bitcoin support wallet standard

- [#3346](https://github.com/reown-com/appkit/pull/3346) [`b7b8e3d`](https://github.com/reown-com/appkit/commit/b7b8e3db393aaa2b42454b7abcd074e2a7f4ab43) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: show correct market price in swaps + ui improvements

- [#3412](https://github.com/reown-com/appkit/pull/3412) [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes embedded mode route redirection issue and adds transition for border radius values

- [#3388](https://github.com/reown-com/appkit/pull/3388) [`1e05f00`](https://github.com/reown-com/appkit/commit/1e05f004b8778c1ce1693681824676fda5b5aa5f) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds error message to email otp verification error event

- Updated dependencies [[`26e9f12`](https://github.com/reown-com/appkit/commit/26e9f12aef1d5e32f7814be189de5d405903b378), [`388e6d6`](https://github.com/reown-com/appkit/commit/388e6d676ffd0bd76d4973b7f3e2c90c459daafb), [`548962c`](https://github.com/reown-com/appkit/commit/548962c710dd973da2128c415bb2beaea044751f), [`7747f6a`](https://github.com/reown-com/appkit/commit/7747f6ac59a95031dc211722d2d611fb63a183d9), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`69f9469`](https://github.com/reown-com/appkit/commit/69f94693357bcf2dbffc8aa4c81aa0c0a592fc1f), [`4d2ddad`](https://github.com/reown-com/appkit/commit/4d2ddad12979a1f79b3c28c9c69d44aad6c9b013), [`8147db9`](https://github.com/reown-com/appkit/commit/8147db90e59c8e9931019479d9584b445a27ce2c), [`0c55e65`](https://github.com/reown-com/appkit/commit/0c55e6576da71a7aa5922a02ff489184bf65c026), [`192e4e0`](https://github.com/reown-com/appkit/commit/192e4e0b256021f97742520532907c2a7a6f30a5), [`1021422`](https://github.com/reown-com/appkit/commit/1021422c157b3a8a4d90edcd40f435adac21d119), [`7236c86`](https://github.com/reown-com/appkit/commit/7236c866986a9bf218963542e445de27b86ab7f0), [`4f9a11b`](https://github.com/reown-com/appkit/commit/4f9a11b84aa31b2190e133701752c4d790e2e17b), [`9fce094`](https://github.com/reown-com/appkit/commit/9fce0941613fa98896d3a0537f7f73b5763d3a07), [`fc59868`](https://github.com/reown-com/appkit/commit/fc59868da9d5a0628b26ad6bc1e8266125e5289e), [`b795289`](https://github.com/reown-com/appkit/commit/b795289673a42d3e7109d98a14c7ef55bf33548d), [`ca659e7`](https://github.com/reown-com/appkit/commit/ca659e71e38cfa137b73b12a42e99cbcf99ff02a), [`4c9410a`](https://github.com/reown-com/appkit/commit/4c9410a76a932b83115f7eec043ff88aab38f7e0), [`26a9ff9`](https://github.com/reown-com/appkit/commit/26a9ff9cb55d7c9f96c2c600da91606247fb4389), [`8f1ce50`](https://github.com/reown-com/appkit/commit/8f1ce503548c1218d5d13f174341a0742aa2d22e), [`d4352b0`](https://github.com/reown-com/appkit/commit/d4352b01aa71f6fce8f67ec50225f51250b0bfc8), [`d07a72b`](https://github.com/reown-com/appkit/commit/d07a72bb6397bb4580b9999bdbe927817d5b015e), [`2a7a963`](https://github.com/reown-com/appkit/commit/2a7a963accb966a42c206fefebd1c9f78b358215), [`50c619a`](https://github.com/reown-com/appkit/commit/50c619aacfbcf34952d78465a597bcbf59d9bdf8), [`9e1e4c9`](https://github.com/reown-com/appkit/commit/9e1e4c9ac565c2164750f178b6d896e57d3b68e5), [`817314f`](https://github.com/reown-com/appkit/commit/817314f2b77dcfedb82a3b700cbcbcac91eb77c1), [`48b9054`](https://github.com/reown-com/appkit/commit/48b90547f06c40a9030c0ea6d869d94237a1053d), [`3e9758e`](https://github.com/reown-com/appkit/commit/3e9758e18b1fb9d3b08546901bbd33fab4f40827), [`53ecc19`](https://github.com/reown-com/appkit/commit/53ecc19bb15f257dfd4afa34c855dd3a0620d4f9), [`76acc12`](https://github.com/reown-com/appkit/commit/76acc1288879884443d71e798f33b81aee1e2945), [`b7b8e3d`](https://github.com/reown-com/appkit/commit/b7b8e3db393aaa2b42454b7abcd074e2a7f4ab43), [`1ca257b`](https://github.com/reown-com/appkit/commit/1ca257be91e131ab140db58c99f979b21306919d), [`1e05f00`](https://github.com/reown-com/appkit/commit/1e05f004b8778c1ce1693681824676fda5b5aa5f), [`b5e2dfa`](https://github.com/reown-com/appkit/commit/b5e2dfab8a3cd96db3e30b5bcaf1478a3d55cb2d)]:
  - @reown/appkit-common@1.6.0
  - @reown/appkit-core@1.6.0
  - @reown/appkit-polyfills@1.6.0
  - @reown/appkit-wallet@1.6.0

## 1.5.3

### Patch Changes

- [#3332](https://github.com/reown-com/appkit/pull/3332) [`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61) Thanks [@zoruka](https://github.com/zoruka)! - Adds check for missing address or chainId when getting siwe session for guarantee of backwards compatibility.

- [#3352](https://github.com/reown-com/appkit/pull/3352) [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue when modal keeps in infinite spinning state when switching to a supported network from unsupported network view

- [#3328](https://github.com/reown-com/appkit/pull/3328) [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue where it is not possible to switch network with MM mobile wallet

- [#3355](https://github.com/reown-com/appkit/pull/3355) [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix a case where adding chains on ethers doesn't work

- [#3329](https://github.com/reown-com/appkit/pull/3329) [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5) Thanks [@enesozturk](https://github.com/enesozturk)! - Sync wagmi status with account controller status

- Updated dependencies [[`60c6b2c`](https://github.com/reown-com/appkit/commit/60c6b2c82b513930e05cdb2ad5eb061d6106ad61), [`824f1df`](https://github.com/reown-com/appkit/commit/824f1df687f6bb54397388e0fa2e2f779ce2b1b2), [`f270e13`](https://github.com/reown-com/appkit/commit/f270e13a9838342064e97a38711f913fd7f0530e), [`2c87bc5`](https://github.com/reown-com/appkit/commit/2c87bc5933da0c039ffa737c65fa69f541c382d5), [`9f48a1d`](https://github.com/reown-com/appkit/commit/9f48a1dcc379958c8068090a7546048686e770e5)]:
  - @reown/appkit-common@1.5.3
  - @reown/appkit-core@1.5.3
  - @reown/appkit-polyfills@1.5.3
  - @reown/appkit-wallet@1.5.3

## 1.5.2

### Patch Changes

- [#3310](https://github.com/reown-com/appkit/pull/3310) [`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Remove coinbase from default screen

- [#3316](https://github.com/reown-com/appkit/pull/3316) [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7) Thanks [@zoruka](https://github.com/zoruka)! - - Fix onSignOut not being called for activeCaipAddress changes;

  - Fix signOut/onSignOut not being called on useDisconnect hook calls;
  - Fix AppKitSIWEClient signIn and signOut methods to call new SIWX handlers;
  - Add tests for mapToSIWX function and usage against AppKit.

- [#3299](https://github.com/reown-com/appkit/pull/3299) [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Resolve cases where wagmi doesn't recognize wc session and unable to switch from unsupported network"

- Updated dependencies [[`7c0a17d`](https://github.com/reown-com/appkit/commit/7c0a17d21392819563652b770f0e87015d6e5a91), [`1f586a2`](https://github.com/reown-com/appkit/commit/1f586a2f974e56192d0e2d43e7d1ac38223ff7c7), [`093a1a6`](https://github.com/reown-com/appkit/commit/093a1a6f1b69e27ecd10a54ff2badf94e070c356)]:
  - @reown/appkit-common@1.5.2
  - @reown/appkit-core@1.5.2
  - @reown/appkit-polyfills@1.5.2
  - @reown/appkit-wallet@1.5.2

## 1.5.1

### Patch Changes

- [#3276](https://github.com/reown-com/appkit/pull/3276) [`6c62b7f`](https://github.com/reown-com/appkit/commit/6c62b7fe34af15b3ef6fff9c5946bbe6c7935742) Thanks [@zoruka](https://github.com/zoruka)! - Removes @reown/appkit-siwe dependency from other packages and improve error message for SIWX request signature function

- [#3219](https://github.com/reown-com/appkit/pull/3219) [`f33aa3b`](https://github.com/reown-com/appkit/commit/f33aa3bd38aa426bcf8ff08ce3314b02bad61e78) Thanks [@tomiir](https://github.com/tomiir)! - Update secure site url to include version 2.0.0 parameter.
  Defers frame load until it's needed on email or social connection or reconnection.

- [#3278](https://github.com/reown-com/appkit/pull/3278) [`0b04fdf`](https://github.com/reown-com/appkit/commit/0b04fdf8b44afc1723708235fdb8009b98ffdcd2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue with broken states on swaps

- [#3286](https://github.com/reown-com/appkit/pull/3286) [`2c82245`](https://github.com/reown-com/appkit/commit/2c82245e40d08d690ea8f5fd9e737e25dc7f1d1b) Thanks [@zoruka](https://github.com/zoruka)! - Remove condition from SIWE signOut returning false to keep backwards compatibility

- [#3290](https://github.com/reown-com/appkit/pull/3290) [`ac1845e`](https://github.com/reown-com/appkit/commit/ac1845e022072e8e2d03449c28229d3576b2dd28) Thanks [@zoruka](https://github.com/zoruka)! - Fix for wrong checking on Solana devnet id

- [#3285](https://github.com/reown-com/appkit/pull/3285) [`329cb92`](https://github.com/reown-com/appkit/commit/329cb92fb87866dff4cf925894ab2e3ac03e0f2c) Thanks [@maxmaxme](https://github.com/maxmaxme)! - Updates Vue type decleration module

- [#3289](https://github.com/reown-com/appkit/pull/3289) [`8236837`](https://github.com/reown-com/appkit/commit/82368374693d4620bf035df2d79b724441c93b0e) Thanks [@zoruka](https://github.com/zoruka)! - Fix wagmi not reconnecting with siwe on page refresh

- [#3271](https://github.com/reown-com/appkit/pull/3271) [`c4d4d2c`](https://github.com/reown-com/appkit/commit/c4d4d2c1ffa5efcd31ee0d182d5fa70b2efdedc0) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Don't show browser wallet when injected provider is not detected

- Updated dependencies [[`6c62b7f`](https://github.com/reown-com/appkit/commit/6c62b7fe34af15b3ef6fff9c5946bbe6c7935742), [`f33aa3b`](https://github.com/reown-com/appkit/commit/f33aa3bd38aa426bcf8ff08ce3314b02bad61e78), [`0b04fdf`](https://github.com/reown-com/appkit/commit/0b04fdf8b44afc1723708235fdb8009b98ffdcd2), [`2c82245`](https://github.com/reown-com/appkit/commit/2c82245e40d08d690ea8f5fd9e737e25dc7f1d1b), [`ac1845e`](https://github.com/reown-com/appkit/commit/ac1845e022072e8e2d03449c28229d3576b2dd28), [`329cb92`](https://github.com/reown-com/appkit/commit/329cb92fb87866dff4cf925894ab2e3ac03e0f2c), [`8236837`](https://github.com/reown-com/appkit/commit/82368374693d4620bf035df2d79b724441c93b0e), [`c4d4d2c`](https://github.com/reown-com/appkit/commit/c4d4d2c1ffa5efcd31ee0d182d5fa70b2efdedc0)]:
  - @reown/appkit-core@1.5.1
  - @reown/appkit-common@1.5.1
  - @reown/appkit-polyfills@1.5.1
  - @reown/appkit-wallet@1.5.1

## 1.5.0

### Minor Changes

- [#3194](https://github.com/reown-com/appkit/pull/3194) [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b) Thanks [@zoruka](https://github.com/zoruka)! - Replace SIWE with new SIWX

### Patch Changes

- [#3266](https://github.com/reown-com/appkit/pull/3266) [`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Show unsupported network UI on reconnect when chainId in wallet is not supported

- [#3254](https://github.com/reown-com/appkit/pull/3254) [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Expose disconnect method

- [#3250](https://github.com/reown-com/appkit/pull/3250) [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixed an issue where MetaMask injected browser didn't show up on ethers in some cases

- Updated dependencies [[`6557a06`](https://github.com/reown-com/appkit/commit/6557a063541fe8edc4a91f28d9956ecd005f2c2b), [`e466bc9`](https://github.com/reown-com/appkit/commit/e466bc9150f148735c3e3d298cf3b4b6740c81e6), [`ee9cef2`](https://github.com/reown-com/appkit/commit/ee9cef2f89408e91035b83c19abb8f4fe8174c0b), [`44bda9f`](https://github.com/reown-com/appkit/commit/44bda9fb32c2db72c0403d1cde2c16b87e2ff1d6)]:
  - @reown/appkit-common@1.5.0
  - @reown/appkit-core@1.5.0
  - @reown/appkit-polyfills@1.5.0
  - @reown/appkit-wallet@1.5.0

## 1.4.1

### Patch Changes

- [#3246](https://github.com/reown-com/appkit/pull/3246) [`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix issue when connectors are not syncing correctly

- Updated dependencies [[`0eb4fd8`](https://github.com/reown-com/appkit/commit/0eb4fd864f4b844dd605887364557ea879e6fce2)]:
  - @reown/appkit-common@1.4.1
  - @reown/appkit-core@1.4.1
  - @reown/appkit-polyfills@1.4.1
  - @reown/appkit-wallet@1.4.1

## 1.4.0

### Minor Changes

- [#3076](https://github.com/reown-com/appkit/pull/3076) [`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Implementing new architecture design for better handling and scalibity of the various adapters

### Patch Changes

- Updated dependencies [[`1bd3dc7`](https://github.com/reown-com/appkit/commit/1bd3dc70850257dd8db523499e8a38e3a0f2ac4a)]:
  - @reown/appkit-polyfills@1.4.0
  - @reown/appkit-common@1.4.0
  - @reown/appkit-wallet@1.4.0
  - @reown/appkit-core@1.4.0

## 1.3.2

### Patch Changes

- [#3216](https://github.com/reown-com/appkit/pull/3216) [`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6) Thanks [@magiziz](https://github.com/magiziz)! - Improved gradient scroll effect on connect view.

- [#3154](https://github.com/reown-com/appkit/pull/3154) [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9) Thanks [@tomiir](https://github.com/tomiir)! - Adds error message to swap error event

- [#3206](https://github.com/reown-com/appkit/pull/3206) [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e) Thanks [@magiziz](https://github.com/magiziz)! - Added walletconnect certified badge in all wallets view.

- [#3220](https://github.com/reown-com/appkit/pull/3220) [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where the connect modal on mobile was always showing 'Browser Wallet' option when the injected provider wasn't detected.

- Updated dependencies [[`66fdcf7`](https://github.com/reown-com/appkit/commit/66fdcf773897cc14347de99810b9ecb26af008f6), [`6d1f9df`](https://github.com/reown-com/appkit/commit/6d1f9df50d5e8ad1189d8b9c4766b14e8f7ff5a9), [`f4ce9d4`](https://github.com/reown-com/appkit/commit/f4ce9d48c0893d5e724788b9f01de42c693e3a5e), [`898c3b4`](https://github.com/reown-com/appkit/commit/898c3b4109ca47a18ceede04ec503a2d741f167d)]:
  - @reown/appkit-common@1.3.2
  - @reown/appkit-core@1.3.2
  - @reown/appkit-polyfills@1.3.2
  - @reown/appkit-wallet@1.3.2

## 1.3.1

### Patch Changes

- [#3207](https://github.com/reown-com/appkit/pull/3207) [`3bfbbb9`](https://github.com/reown-com/appkit/commit/3bfbbb947f53dc49de3ab467e03c35e81aa72787) Thanks [@magiziz](https://github.com/magiziz)! - Introduced a new feature with an option to enable the terms of service and/or privacy policy checkbox.

  **Example usage**

  ```ts
  import { mainnet } from '@reown/appkit/networks'
  import { createAppKit } from '@reown/appkit/react'

  const modal = createAppKit({
    adapters: [
      /* adapters */
    ],
    networks: [mainnet],
    defaultNetwork: mainnet,
    projectId: 'YOUR_PROJECT_ID',
    features: {
      legalCheckbox: true // Optional - defaults to false
    },
    termsConditionsUrl: '...',
    privacyPolicyUrl: '...'
  })
  ```

- [#3179](https://github.com/reown-com/appkit/pull/3179) [`ffb30d3`](https://github.com/reown-com/appkit/commit/ffb30d37a3a193c1dc18d152177f12d869110a3d) Thanks [@zoruka](https://github.com/zoruka)! - Fixes for improving SIWX initialization and flows

- [#3197](https://github.com/reown-com/appkit/pull/3197) [`879ad0a`](https://github.com/reown-com/appkit/commit/879ad0ad98b8a41fcb66c0bf5a75ceacd05d367d) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors Vue hooks to listen state as expected

- Updated dependencies [[`3bfbbb9`](https://github.com/reown-com/appkit/commit/3bfbbb947f53dc49de3ab467e03c35e81aa72787), [`ffb30d3`](https://github.com/reown-com/appkit/commit/ffb30d37a3a193c1dc18d152177f12d869110a3d), [`879ad0a`](https://github.com/reown-com/appkit/commit/879ad0ad98b8a41fcb66c0bf5a75ceacd05d367d)]:
  - @reown/appkit-core@1.3.1
  - @reown/appkit-common@1.3.1
  - @reown/appkit-polyfills@1.3.1
  - @reown/appkit-wallet@1.3.1

## 1.3.0

### Minor Changes

- [#3186](https://github.com/reown-com/appkit/pull/3186) [`41c0292`](https://github.com/reown-com/appkit/commit/41c02928b9171651da705778891c08cac1b3ae19) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates public component names with appkit prefix

### Patch Changes

- [#3188](https://github.com/reown-com/appkit/pull/3188) [`69e8bde`](https://github.com/reown-com/appkit/commit/69e8bdec3276e35a809912053c27828ab49fc964) Thanks [@magiziz](https://github.com/magiziz)! - Improved error handling for auth and universal provider connectors.

- [#3189](https://github.com/reown-com/appkit/pull/3189) [`db30b41`](https://github.com/reown-com/appkit/commit/db30b4160b130295dfd1e3276627f584e27537bd) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where Coinbase Wallet did not reconnect after refreshing the page when using ethers/ethers5 adapters.

- [#3190](https://github.com/reown-com/appkit/pull/3190) [`d9bb0bb`](https://github.com/reown-com/appkit/commit/d9bb0bb86e872cb0b74a0d2114130f09f89e9ac8) Thanks [@magiziz](https://github.com/magiziz)! - Fixes issue where ethers and ethers5 adapters didn't set the proper caip address when switching accounts manually.

- [#3201](https://github.com/reown-com/appkit/pull/3201) [`48cbfbe`](https://github.com/reown-com/appkit/commit/48cbfbeb7831109ee564d67151715336aa445c1e) Thanks [@tomiir](https://github.com/tomiir)! - Adds clientId to all blockchain api requests on a relay connection

- [#3191](https://github.com/reown-com/appkit/pull/3191) [`a3cf602`](https://github.com/reown-com/appkit/commit/a3cf602e95301e91f27970b9901abab382122080) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where email input validation errors broke the button styles.

- [#3203](https://github.com/reown-com/appkit/pull/3203) [`05feaed`](https://github.com/reown-com/appkit/commit/05feaed87c8181987cad508fe4725ca64ba56ab7) Thanks [@tomiir](https://github.com/tomiir)! - Improves SnackBar styles and routes proper relay messages to it on wc-connecting-view

- [#3193](https://github.com/reown-com/appkit/pull/3193) [`56fe99a`](https://github.com/reown-com/appkit/commit/56fe99ad21cd468a0203b5f2b5dd3bd29d9ba020) Thanks [@tomiir](https://github.com/tomiir)! - Improves UX/UI of multi-account screen for embedded wallet

- Updated dependencies [[`69e8bde`](https://github.com/reown-com/appkit/commit/69e8bdec3276e35a809912053c27828ab49fc964), [`db30b41`](https://github.com/reown-com/appkit/commit/db30b4160b130295dfd1e3276627f584e27537bd), [`d9bb0bb`](https://github.com/reown-com/appkit/commit/d9bb0bb86e872cb0b74a0d2114130f09f89e9ac8), [`41c0292`](https://github.com/reown-com/appkit/commit/41c02928b9171651da705778891c08cac1b3ae19), [`48cbfbe`](https://github.com/reown-com/appkit/commit/48cbfbeb7831109ee564d67151715336aa445c1e), [`a3cf602`](https://github.com/reown-com/appkit/commit/a3cf602e95301e91f27970b9901abab382122080), [`05feaed`](https://github.com/reown-com/appkit/commit/05feaed87c8181987cad508fe4725ca64ba56ab7), [`56fe99a`](https://github.com/reown-com/appkit/commit/56fe99ad21cd468a0203b5f2b5dd3bd29d9ba020)]:
  - @reown/appkit-common@1.3.0
  - @reown/appkit-core@1.3.0
  - @reown/appkit-polyfills@1.3.0
  - @reown/appkit-wallet@1.3.0

## 1.2.1

### Patch Changes

- [#3172](https://github.com/reown-com/appkit/pull/3172) [`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX Solana verifier

- [#2827](https://github.com/reown-com/appkit/pull/2827) [`3d40e7c`](https://github.com/reown-com/appkit/commit/3d40e7c4df068f074367eda2b682345f9441fcf8) Thanks [@tomiir](https://github.com/tomiir)! - Removes intermediate screen for Embedded Wallet multi-account

- [#3161](https://github.com/reown-com/appkit/pull/3161) [`6eef87d`](https://github.com/reown-com/appkit/commit/6eef87d234384e93e8cac75632188bfd21918de4) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where metadata values weren't included in the universal provider.

- [#3123](https://github.com/reown-com/appkit/pull/3123) [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8) Thanks [@zoruka](https://github.com/zoruka)! - Adds SIWX package

- [#3164](https://github.com/reown-com/appkit/pull/3164) [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds switch network methods and hooks

- [#3173](https://github.com/reown-com/appkit/pull/3173) [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds listeners for account and network states for plain JS users

- [#3175](https://github.com/reown-com/appkit/pull/3175) [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes swap gas availability check for smart accounts

- [#3174](https://github.com/reown-com/appkit/pull/3174) [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c) Thanks [@enesozturk](https://github.com/enesozturk)! - Switch to ES build for CDN use cases

- [#3171](https://github.com/reown-com/appkit/pull/3171) [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98) Thanks [@zoruka](https://github.com/zoruka)! - Adds UI components for SIWX

- Updated dependencies [[`2338332`](https://github.com/reown-com/appkit/commit/2338332c9ddd241d095aef9ad89a761aab972b77), [`3d40e7c`](https://github.com/reown-com/appkit/commit/3d40e7c4df068f074367eda2b682345f9441fcf8), [`6eef87d`](https://github.com/reown-com/appkit/commit/6eef87d234384e93e8cac75632188bfd21918de4), [`5996ef6`](https://github.com/reown-com/appkit/commit/5996ef6f4a3713da14ddd6d76344930b1e2f94b8), [`14d41d8`](https://github.com/reown-com/appkit/commit/14d41d856817d3ebe388a5f8662e37d32e0974f1), [`494423d`](https://github.com/reown-com/appkit/commit/494423ddd3ae966b862178b6cd1e24f09a1bc15a), [`132a9bb`](https://github.com/reown-com/appkit/commit/132a9bbd4a23bb872c49070bfac706073fb93c24), [`dba7228`](https://github.com/reown-com/appkit/commit/dba7228bbf1f242a9dc6a1483541ac6e350a786c), [`f0877f7`](https://github.com/reown-com/appkit/commit/f0877f7295d771aa1b04a3485e8033dba6d42d98)]:
  - @reown/appkit-common@1.2.1
  - @reown/appkit-core@1.2.1
  - @reown/appkit-polyfills@1.2.1
  - @reown/appkit-wallet@1.2.1

## 1.2.0

### Minor Changes

- [#3153](https://github.com/reown-com/appkit/pull/3153) [`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where metadata values weren't overriding.

### Patch Changes

- Updated dependencies [[`9413662`](https://github.com/reown-com/appkit/commit/941366260caa945a73c509031c4045d84bb2fabe)]:
  - @reown/appkit-common@1.2.0
  - @reown/appkit-core@1.2.0
  - @reown/appkit-polyfills@1.2.0

## 1.1.8

### Patch Changes

- [#3135](https://github.com/reown-com/appkit/pull/3135) [`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where `chainImages` option weren't working.

- [#3144](https://github.com/reown-com/appkit/pull/3144) [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72) Thanks [@magiziz](https://github.com/magiziz)! - Optimized connection handling for connectors.

- [#3148](https://github.com/reown-com/appkit/pull/3148) [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where multichain connectors weren't working.

- Updated dependencies [[`e16f0fe`](https://github.com/reown-com/appkit/commit/e16f0fe0dcc8c049e9c38560e177247c1eea9779), [`e5a5397`](https://github.com/reown-com/appkit/commit/e5a5397501f963c94ef72d9d35dba95da04d6d05), [`91253b7`](https://github.com/reown-com/appkit/commit/91253b7e6f6f6f7ae312fee8c3156204fb0ecf72), [`b0cfe68`](https://github.com/reown-com/appkit/commit/b0cfe68faac9d7d85b8c80de50e87a2f0a104a35)]:
  - @reown/appkit-wallet@1.2.0
  - @reown/appkit-common@1.1.8
  - @reown/appkit-core@1.1.8
  - @reown/appkit-polyfills@1.1.8

## 1.1.7

### Patch Changes

- [#3108](https://github.com/reown-com/appkit/pull/3108) [`7523543`](https://github.com/reown-com/appkit/commit/7523543f5efd1e180f667fb9ed9b95459a332c78) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors adapters to handle account switches properly

- [#3113](https://github.com/reown-com/appkit/pull/3113) [`0c93f2f`](https://github.com/reown-com/appkit/commit/0c93f2f64b3d8c71b902815991162ce84024a202) Thanks [@zoruka](https://github.com/zoruka)! - Adds experimental:

  - SIWX interfaces
  - SIWX AppKit options config
  - SIWX initialization

- [#3121](https://github.com/reown-com/appkit/pull/3121) [`f30d116`](https://github.com/reown-com/appkit/commit/f30d11632e3beee7cefe6863fb7873b420a6e84f) Thanks [@magiziz](https://github.com/magiziz)! - Added `useDisconnect` hook to `@reown/appkit/react` and `@reown/appkit/vue`.

- Updated dependencies [[`7523543`](https://github.com/reown-com/appkit/commit/7523543f5efd1e180f667fb9ed9b95459a332c78), [`0c93f2f`](https://github.com/reown-com/appkit/commit/0c93f2f64b3d8c71b902815991162ce84024a202), [`f30d116`](https://github.com/reown-com/appkit/commit/f30d11632e3beee7cefe6863fb7873b420a6e84f)]:
  - @reown/appkit-common@1.1.7
  - @reown/appkit-core@1.1.7
  - @reown/appkit-polyfills@1.1.7
  - @reown/appkit-wallet@1.1.7

## 1.1.6

### Patch Changes

- [#3110](https://github.com/reown-com/appkit/pull/3110) [`5767552`](https://github.com/reown-com/appkit/commit/5767552e61505bf3726dae35c84fe7601112199d) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where web app wallets weren't working.

- [#3106](https://github.com/reown-com/appkit/pull/3106) [`28b3311`](https://github.com/reown-com/appkit/commit/28b3311b9cafeae374b147e7283448e2d518087f) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where `eth_getBalance` was being called twice after connection.

- [#3111](https://github.com/reown-com/appkit/pull/3111) [`1a7a872`](https://github.com/reown-com/appkit/commit/1a7a8722d4065448831fc31126baa3f946f80060) Thanks [@tomiir](https://github.com/tomiir)! - Increases timeout for balance unavailable toast to 30s.

- [#3101](https://github.com/reown-com/appkit/pull/3101) [`41eed18`](https://github.com/reown-com/appkit/commit/41eed1835c244e407a2295ef8024d52d92ad82dd) Thanks [@enesozturk](https://github.com/enesozturk)! - Export Wagmi packages from CDN package

- [#3107](https://github.com/reown-com/appkit/pull/3107) [`d3c92fb`](https://github.com/reown-com/appkit/commit/d3c92fb036954723f074d173704a84fc2c424443) Thanks [@tomiir](https://github.com/tomiir)! - Adds experimental sessions feature ui elements and flows.
  Adds revoke session flow.

- [#3100](https://github.com/reown-com/appkit/pull/3100) [`201484e`](https://github.com/reown-com/appkit/commit/201484e0a49dd4a2465c55b83c90dfc3a631f9ee) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where the wagmi adapter was making excessive network calls.

- Updated dependencies [[`5767552`](https://github.com/reown-com/appkit/commit/5767552e61505bf3726dae35c84fe7601112199d), [`28b3311`](https://github.com/reown-com/appkit/commit/28b3311b9cafeae374b147e7283448e2d518087f), [`1a7a872`](https://github.com/reown-com/appkit/commit/1a7a8722d4065448831fc31126baa3f946f80060), [`41eed18`](https://github.com/reown-com/appkit/commit/41eed1835c244e407a2295ef8024d52d92ad82dd), [`d3c92fb`](https://github.com/reown-com/appkit/commit/d3c92fb036954723f074d173704a84fc2c424443), [`201484e`](https://github.com/reown-com/appkit/commit/201484e0a49dd4a2465c55b83c90dfc3a631f9ee)]:
  - @reown/appkit-common@1.1.6
  - @reown/appkit-core@1.1.6
  - @reown/appkit-polyfills@1.1.6
  - @reown/appkit-wallet@1.1.6

## 1.1.5

### Patch Changes

- [#3096](https://github.com/reown-com/appkit/pull/3096) [`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576) Thanks [@magiziz](https://github.com/magiziz)! - Refactored token balance error message and ensured that token balances are only fetched again after 5 seconds if the token balance API fails.

- [#3080](https://github.com/reown-com/appkit/pull/3080) [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where recommendations would use outdated ids instead of reown.id.

- [#3095](https://github.com/reown-com/appkit/pull/3095) [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor toast/snackbar component to be able to call sequentially

- Updated dependencies [[`3bb4660`](https://github.com/reown-com/appkit/commit/3bb4660d956b473b04e20e43e6082c66a46aa576), [`ed34813`](https://github.com/reown-com/appkit/commit/ed348135bf3efdc23841c484b1a03d292ef0d401), [`9863e0c`](https://github.com/reown-com/appkit/commit/9863e0c8b9d35b740bc2c56cbc92dba892c21a24)]:
  - @reown/appkit-core@1.1.5
  - @reown/appkit-common@1.1.5
  - @reown/appkit-polyfills@1.1.5
  - @reown/appkit-wallet@1.1.5

## 1.1.4

### Patch Changes

- [#3082](https://github.com/reown-com/appkit/pull/3082) [`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614) Thanks [@tomiir](https://github.com/tomiir)! - Adds wui-permission-contract-call to experimental package. Adds w3m-smart-session-created-view to experimental package

- [#3086](https://github.com/reown-com/appkit/pull/3086) [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655) Thanks [@magiziz](https://github.com/magiziz)! - Fixes an issue where ethers and ethers5 adapters were causing infinite network requests

- Updated dependencies [[`bbc48bc`](https://github.com/reown-com/appkit/commit/bbc48bcf8cfe2eca801c9a6619c7c9b437df4614), [`d27bd6d`](https://github.com/reown-com/appkit/commit/d27bd6da9a6e4942fc4d2a211f3a0dde6fe73655)]:
  - @reown/appkit-core@1.1.4
  - @reown/appkit-common@1.1.4
  - @reown/appkit-polyfills@1.1.4
  - @reown/appkit-wallet@1.1.4

## 1.1.3

### Patch Changes

- [#3075](https://github.com/reown-com/appkit/pull/3075) [`7f99593`](https://github.com/reown-com/appkit/commit/7f99593a1b413ee433f21356ff1d4d9cea96f135) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Added NativeTokenRecurringAllowancePermission and ERC20RecurringAllowancePermission support on appkit-experimental/smart-session sdk

- [#3081](https://github.com/reown-com/appkit/pull/3081) [`9d8ce0a`](https://github.com/reown-com/appkit/commit/9d8ce0a2d34d61f0ddc037752ee0cc1733c99de6) Thanks [@magiziz](https://github.com/magiziz)! - Refactored frame timeouts

- [#3073](https://github.com/reown-com/appkit/pull/3073) [`3627dd1`](https://github.com/reown-com/appkit/commit/3627dd11bd1bc8d5d8c66d59f655675af1d369fd) Thanks [@magiziz](https://github.com/magiziz)! - Added maximum timeouts for frame requests

- [#3068](https://github.com/reown-com/appkit/pull/3068) [`bf5bfb3`](https://github.com/reown-com/appkit/commit/bf5bfb33a8226f0cf85366ddc3b00fb74d6555ab) Thanks [@magiziz](https://github.com/magiziz)! - Improved account name selection flow

- [#2777](https://github.com/reown-com/appkit/pull/2777) [`a4de9f8`](https://github.com/reown-com/appkit/commit/a4de9f8de3ae0bf807006325b2dd14d42b91a078) Thanks [@bulgakovk](https://github.com/bulgakovk)! - Fix displaying pure EIP-6963 wallets.

- [#3069](https://github.com/reown-com/appkit/pull/3069) [`6cf5745`](https://github.com/reown-com/appkit/commit/6cf57458fb4b957dbea9dfc43424ee479ca4a989) Thanks [@KannuSingh](https://github.com/KannuSingh)! - fix: set status on syncAccount when connector is walletconnect for wagmi adapter

- [#3085](https://github.com/reown-com/appkit/pull/3085) [`185ff63`](https://github.com/reown-com/appkit/commit/185ff636aefdb09a5f1cbb97ae79051f639e9d58) Thanks [@enesozturk](https://github.com/enesozturk)! - Adds Unichain support to the RPC supported networks array

- [#3072](https://github.com/reown-com/appkit/pull/3072) [`e4adf06`](https://github.com/reown-com/appkit/commit/e4adf06af522684efbacae613bb954cbac7454a2) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors wagmi constructor to handle custom transpor objects

- Updated dependencies [[`7f99593`](https://github.com/reown-com/appkit/commit/7f99593a1b413ee433f21356ff1d4d9cea96f135), [`9d8ce0a`](https://github.com/reown-com/appkit/commit/9d8ce0a2d34d61f0ddc037752ee0cc1733c99de6), [`3627dd1`](https://github.com/reown-com/appkit/commit/3627dd11bd1bc8d5d8c66d59f655675af1d369fd), [`bf5bfb3`](https://github.com/reown-com/appkit/commit/bf5bfb33a8226f0cf85366ddc3b00fb74d6555ab), [`a4de9f8`](https://github.com/reown-com/appkit/commit/a4de9f8de3ae0bf807006325b2dd14d42b91a078), [`6cf5745`](https://github.com/reown-com/appkit/commit/6cf57458fb4b957dbea9dfc43424ee479ca4a989), [`185ff63`](https://github.com/reown-com/appkit/commit/185ff636aefdb09a5f1cbb97ae79051f639e9d58), [`e4adf06`](https://github.com/reown-com/appkit/commit/e4adf06af522684efbacae613bb954cbac7454a2)]:
  - @reown/appkit-common@1.1.3
  - @reown/appkit-core@1.1.3
  - @reown/appkit-polyfills@1.1.3
  - @reown/appkit-wallet@1.1.3

## 1.1.2

### Patch Changes

- [#3014](https://github.com/reown-com/appkit/pull/3014) [`53f5525`](https://github.com/reown-com/appkit/commit/53f552510380e99f95a2ac7065be3cb81d674dab) Thanks [@Magehernan](https://github.com/Magehernan)! - Removes connector list variable duplication for wagmi adapter

- [#2858](https://github.com/reown-com/appkit/pull/2858) [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0) Thanks [@renovate](https://github.com/apps/renovate)! - Upgrades ethers v6

- [#3048](https://github.com/reown-com/appkit/pull/3048) [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098) Thanks [@KannuSingh](https://github.com/KannuSingh)! - fix: add missing setProvider and setProviderId call for connector other than walletconnect on syncAccount

- [#3053](https://github.com/reown-com/appkit/pull/3053) [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808) Thanks [@enesozturk](https://github.com/enesozturk)! - Reverts removing types package on ethers adapter

- [#3027](https://github.com/reown-com/appkit/pull/3027) [`30e2ee5`](https://github.com/reown-com/appkit/commit/30e2ee523de1150a66727582d0522bfd7e9b7264) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes beta tag from Swap screens

- [#3046](https://github.com/reown-com/appkit/pull/3046) [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactor CDN package to properly export our modules

- [#3058](https://github.com/reown-com/appkit/pull/3058) [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da) Thanks [@magiziz](https://github.com/magiziz)! - Improved mobile connection UX

- Updated dependencies [[`53f5525`](https://github.com/reown-com/appkit/commit/53f552510380e99f95a2ac7065be3cb81d674dab), [`e95ecde`](https://github.com/reown-com/appkit/commit/e95ecdea26614b4428e31dd6075efcce7a01a5e0), [`2751feb`](https://github.com/reown-com/appkit/commit/2751feb985e9d15a6babd5584f75a50ba7fb1098), [`3c6e2c7`](https://github.com/reown-com/appkit/commit/3c6e2c7a915f1d16d26c8c2fb9bd137adc18b808), [`30e2ee5`](https://github.com/reown-com/appkit/commit/30e2ee523de1150a66727582d0522bfd7e9b7264), [`3b3b124`](https://github.com/reown-com/appkit/commit/3b3b124ba9138b47aeae193491b36f495bd7da89), [`91c1be7`](https://github.com/reown-com/appkit/commit/91c1be7c35165e94e5107ac4c4cb5d406d3ea5da)]:
  - @reown/appkit-common@1.1.2
  - @reown/appkit-core@1.1.2
  - @reown/appkit-polyfills@1.1.2
  - @reown/appkit-wallet@1.1.2

## 1.1.1

### Patch Changes

- [#3036](https://github.com/reown-com/appkit/pull/3036) [`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes assert syntax to import json modules

- Updated dependencies [[`23a7613`](https://github.com/reown-com/appkit/commit/23a7613fc2d3516a85183eae325aedacaac0a073)]:
  - @reown/appkit-common@1.1.1
  - @reown/appkit-core@1.1.1
  - @reown/appkit-polyfills@1.1.1
  - @reown/appkit-wallet@1.1.1

## 1.1.0

### Minor Changes

- [#2955](https://github.com/reown-com/appkit/pull/2955) [`c5a2107`](https://github.com/reown-com/appkit/commit/c5a21078a4b04e0518015c3600b16851b6d5318b) Thanks [@enesozturk](https://github.com/enesozturk)! - Add Viem chains support

### Patch Changes

- [#3012](https://github.com/reown-com/appkit/pull/3012) [`e1b8720`](https://github.com/reown-com/appkit/commit/e1b8720121fd49985fe488e401600482ce691571) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where SIWE modal wasn't showing up for some mobile wallets.

- [#3033](https://github.com/reown-com/appkit/pull/3033) [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades solana/web3js deps

- [#2999](https://github.com/reown-com/appkit/pull/2999) [`72010c6`](https://github.com/reown-com/appkit/commit/72010c694d1b7a4c21995e64cfa51d6df0f966d8) Thanks [@zoruka](https://github.com/zoruka)! - Remove duplicated Solana chains declared on Solana Adapter package.

- [#3002](https://github.com/reown-com/appkit/pull/3002) [`d558f2b`](https://github.com/reown-com/appkit/commit/d558f2bfbf215928eded5236a3dd984c76fd9c37) Thanks [@tomiir](https://github.com/tomiir)! - Exposes version in AppKit class

- [#3032](https://github.com/reown-com/appkit/pull/3032) [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec) Thanks [@enesozturk](https://github.com/enesozturk)! - Exports util functions for networks path

- [#3030](https://github.com/reown-com/appkit/pull/3030) [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19) Thanks [@KannuSingh](https://github.com/KannuSingh)! - Added experimental package with smart-session feature.

- Updated dependencies [[`c5a2107`](https://github.com/reown-com/appkit/commit/c5a21078a4b04e0518015c3600b16851b6d5318b), [`e1b8720`](https://github.com/reown-com/appkit/commit/e1b8720121fd49985fe488e401600482ce691571), [`789df12`](https://github.com/reown-com/appkit/commit/789df124487f3facf22501ad570cbf6423533564), [`72010c6`](https://github.com/reown-com/appkit/commit/72010c694d1b7a4c21995e64cfa51d6df0f966d8), [`d558f2b`](https://github.com/reown-com/appkit/commit/d558f2bfbf215928eded5236a3dd984c76fd9c37), [`2b1d72a`](https://github.com/reown-com/appkit/commit/2b1d72a301e2f07119e1c9eda260adda5c34a3ec), [`aced68a`](https://github.com/reown-com/appkit/commit/aced68ad4328351ccff2d934fc689f2ad51cbc19)]:
  - @reown/appkit-common@1.1.0
  - @reown/appkit-core@1.1.0
  - @reown/appkit-polyfills@1.1.0
  - @reown/appkit-wallet@1.1.0

## 1.0.7

### Patch Changes

- [#2977](https://github.com/reown-com/appkit/pull/2977) [`d45545d`](https://github.com/reown-com/appkit/commit/d45545ddd4073c35214db273b090ae8b4df9ef61) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where email line separator was not showing when social logins were disabled and `emailShowWallets` was set to false.

- [#2990](https://github.com/reown-com/appkit/pull/2990) [`c2e391d`](https://github.com/reown-com/appkit/commit/c2e391d832aa3b5a1c2850cc49467bd4ef1e56f9) Thanks [@zoruka](https://github.com/zoruka)! - Fixes external connectors not appearing when using Solana adapter

- [#2998](https://github.com/reown-com/appkit/pull/2998) [`e1081e9`](https://github.com/reown-com/appkit/commit/e1081e957b3ed73c068d6092923b59b0e27815d1) Thanks [@zoruka](https://github.com/zoruka)! - Fixes failing to connect with extension wallets on Solana Adapter

- [#2985](https://github.com/reown-com/appkit/pull/2985) [`b949143`](https://github.com/reown-com/appkit/commit/b949143a0838810f7ae17a85e4c17acae10b888c) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates wagmi adapter to pass all custom wagmi configs to the createConfig function

- [#3001](https://github.com/reown-com/appkit/pull/3001) [`6ad2530`](https://github.com/reown-com/appkit/commit/6ad253000261e60ddc0f60b341a658da6636bd3e) Thanks [@tomiir](https://github.com/tomiir)! - Adds FRAME_READY event for W3mFrameProvider

- [#2989](https://github.com/reown-com/appkit/pull/2989) [`d40f978`](https://github.com/reown-com/appkit/commit/d40f978fe685fbc9599cdac36a99b12ec4350d3c) Thanks [@zoruka](https://github.com/zoruka)! - Disable names feature flow for Solana networks

- Updated dependencies [[`d45545d`](https://github.com/reown-com/appkit/commit/d45545ddd4073c35214db273b090ae8b4df9ef61), [`c2e391d`](https://github.com/reown-com/appkit/commit/c2e391d832aa3b5a1c2850cc49467bd4ef1e56f9), [`e1081e9`](https://github.com/reown-com/appkit/commit/e1081e957b3ed73c068d6092923b59b0e27815d1), [`b949143`](https://github.com/reown-com/appkit/commit/b949143a0838810f7ae17a85e4c17acae10b888c), [`6ad2530`](https://github.com/reown-com/appkit/commit/6ad253000261e60ddc0f60b341a658da6636bd3e), [`d40f978`](https://github.com/reown-com/appkit/commit/d40f978fe685fbc9599cdac36a99b12ec4350d3c)]:
  - @reown/appkit-common@1.0.7
  - @reown/appkit-core@1.0.7
  - @reown/appkit-polyfills@1.0.7
  - @reown/appkit-wallet@1.0.7

## 1.0.6

### Patch Changes

- [#2970](https://github.com/reown-com/appkit/pull/2970) [`e6a36a7`](https://github.com/reown-com/appkit/commit/e6a36a746e85ced1f89fc1d7227e25df1559f063) Thanks [@magiziz](https://github.com/magiziz)! - Introducing debug mode. This is useful for seeing UI alerts while debugging.

  **Example usage**

  ```ts
  import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
  import { mainnet } from '@reown/appkit/networks'
  import { createAppKit } from '@reown/appkit/react'

  const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    networks: [mainnet],
    projectId: 'YOUR_PROJECT_ID'
  })

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [mainnet],
    projectId: 'YOUR_PROJECT_ID',
    debug: true // Optional - defaults to false
  })
  ```

- [#2984](https://github.com/reown-com/appkit/pull/2984) [`b5444bd`](https://github.com/reown-com/appkit/commit/b5444bdd454d370cf3f17267d457cd46de10a5b9) Thanks [@magiziz](https://github.com/magiziz)! - Changed logger imports to not cause the webpack bundler to throw a CommonJS module error.

- [#2974](https://github.com/reown-com/appkit/pull/2974) [`0563711`](https://github.com/reown-com/appkit/commit/05637111aba940af5f46215336268294675322fd) Thanks [@magiziz](https://github.com/magiziz)! - Added create wallet flow in connect modal

- Updated dependencies [[`e6a36a7`](https://github.com/reown-com/appkit/commit/e6a36a746e85ced1f89fc1d7227e25df1559f063), [`b5444bd`](https://github.com/reown-com/appkit/commit/b5444bdd454d370cf3f17267d457cd46de10a5b9), [`0563711`](https://github.com/reown-com/appkit/commit/05637111aba940af5f46215336268294675322fd)]:
  - @reown/appkit-common@1.0.6
  - @reown/appkit-core@1.0.6
  - @reown/appkit-polyfills@1.0.6
  - @reown/appkit-wallet@1.0.6

## 1.0.5

### Patch Changes

- [#2872](https://github.com/reown-com/appkit/pull/2872) [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513) Thanks [@zoruka](https://github.com/zoruka)! - Get correct data from session namespaces and set it for approved caip networks data on UniversalProvider usage"

- [#2937](https://github.com/reown-com/appkit/pull/2937) [`97dd79d`](https://github.com/reown-com/appkit/commit/97dd79df711201d5b7450fb10544f063975e6cb6) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates adapter packages dependency managements

- [#2919](https://github.com/reown-com/appkit/pull/2919) [`e2bacfd`](https://github.com/reown-com/appkit/commit/e2bacfd0aaa9a83060d3181678c42dd9cc90293b) Thanks [@zoruka](https://github.com/zoruka)! - Adds batched call for solana_signAllTransactions RPC call on Solana WalletConnectProvider

- [#2872](https://github.com/reown-com/appkit/pull/2872) [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513) Thanks [@zoruka](https://github.com/zoruka)! - Implement the correct logic for getting available networks when using universal provider

- [#2927](https://github.com/reown-com/appkit/pull/2927) [`865320c`](https://github.com/reown-com/appkit/commit/865320c709bb76a61ec88c786c6b2a354c8b4b8b) Thanks [@enesozturk](https://github.com/enesozturk)! - Refactors setting active CAIP address and aligns ethers5 adapter with ethers

- [#2920](https://github.com/reown-com/appkit/pull/2920) [`eeb9207`](https://github.com/reown-com/appkit/commit/eeb92079b4bb37d2cb9db68f51bcdeb87bd83af3) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: use usdt abi for usdt transactions

- [#2916](https://github.com/reown-com/appkit/pull/2916) [`cc35726`](https://github.com/reown-com/appkit/commit/cc357269ec04c6372c50d3bf00c674bfe182128b) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: override ens profile picture if resolved

- [#2934](https://github.com/reown-com/appkit/pull/2934) [`6faa782`](https://github.com/reown-com/appkit/commit/6faa7829c73b98430f1d8873bd9caf6c90046f2e) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes swap amount calculation to prevent floating numbers

- [#2947](https://github.com/reown-com/appkit/pull/2947) [`bad570a`](https://github.com/reown-com/appkit/commit/bad570a9806785854cea4573cfb1e5bfb4e4a8fb) Thanks [@magiziz](https://github.com/magiziz)! - Replaced multi-account screen with single account screen when only one account is connected

- [#2944](https://github.com/reown-com/appkit/pull/2944) [`8baf998`](https://github.com/reown-com/appkit/commit/8baf998133d0bbab4f87f15a0337d4b1452912d7) Thanks [@tomiir](https://github.com/tomiir)! - Fix issue where wagmis useDisconnect hook would not disconnect appkit internally

- Updated dependencies [[`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513), [`97dd79d`](https://github.com/reown-com/appkit/commit/97dd79df711201d5b7450fb10544f063975e6cb6), [`e2bacfd`](https://github.com/reown-com/appkit/commit/e2bacfd0aaa9a83060d3181678c42dd9cc90293b), [`f5dc9fa`](https://github.com/reown-com/appkit/commit/f5dc9fa1ec5c853f0ee7edbeb0aa6f053bdc5513), [`865320c`](https://github.com/reown-com/appkit/commit/865320c709bb76a61ec88c786c6b2a354c8b4b8b), [`eeb9207`](https://github.com/reown-com/appkit/commit/eeb92079b4bb37d2cb9db68f51bcdeb87bd83af3), [`cc35726`](https://github.com/reown-com/appkit/commit/cc357269ec04c6372c50d3bf00c674bfe182128b), [`6faa782`](https://github.com/reown-com/appkit/commit/6faa7829c73b98430f1d8873bd9caf6c90046f2e), [`bad570a`](https://github.com/reown-com/appkit/commit/bad570a9806785854cea4573cfb1e5bfb4e4a8fb), [`8baf998`](https://github.com/reown-com/appkit/commit/8baf998133d0bbab4f87f15a0337d4b1452912d7)]:
  - @reown/appkit-core@1.0.5
  - @reown/appkit-common@1.0.5
  - @reown/appkit-polyfills@1.0.5
  - @reown/appkit-wallet@1.0.5

## 1.0.4

### Patch Changes

- [#2907](https://github.com/reown-com/appkit/pull/2907) [`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where featured wallet ids were being filtered out if their connector was present but not displayed. eg. SDK Connectors.

- [#2882](https://github.com/reown-com/appkit/pull/2882) [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b) Thanks [@magiziz](https://github.com/magiziz)! - Fixed deep link not working after connecting a wallet

- Updated dependencies [[`b35af73`](https://github.com/reown-com/appkit/commit/b35af73dde9c46142741bd153e9e7105c077cfbd), [`aaa22cf`](https://github.com/reown-com/appkit/commit/aaa22cfdb620d44da52466c1cc9270ad88f4c81b)]:
  - @reown/appkit-common@1.0.4
  - @reown/appkit-core@1.0.4
  - @reown/appkit-polyfills@1.0.4
  - @reown/appkit-wallet@1.0.4

## 1.0.3

### Patch Changes

- [#2897](https://github.com/reown-com/appkit/pull/2897) [`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d) Thanks [@tomiir](https://github.com/tomiir)! - Makes SDKType param optional

- [#2889](https://github.com/reown-com/appkit/pull/2889) [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Update siweParams with AppKit chains

- [#2888](https://github.com/reown-com/appkit/pull/2888) [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates active network state management and local storage controls

- Updated dependencies [[`fb20e46`](https://github.com/reown-com/appkit/commit/fb20e461ee6745b83d9cdf5051fc4c674e0d793d), [`dc7b895`](https://github.com/reown-com/appkit/commit/dc7b89527e4dd3c4602db69491be5bc03a9c52d3), [`1086727`](https://github.com/reown-com/appkit/commit/1086727e024bafbbebe0059635c4d8728a7fb6b9)]:
  - @reown/appkit-wallet@1.0.3
  - @reown/appkit-common@1.0.3
  - @reown/appkit-core@1.0.3
  - @reown/appkit-polyfills@1.0.3

## 1.0.2

### Patch Changes

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where wagmi would not reconnect on an active session

- [#2867](https://github.com/reown-com/appkit/pull/2867) [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687) Thanks [@zoruka](https://github.com/zoruka)! - Refactors solana network and account syncing logic to clean up the code and fix missing project id for solana connection

- [#2879](https://github.com/reown-com/appkit/pull/2879) [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2) Thanks [@zoruka](https://github.com/zoruka)! - Add Solana CoinbaseWalletProvider to allow connecting with coinbase extension

- [#2881](https://github.com/reown-com/appkit/pull/2881) [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240) Thanks [@tomiir](https://github.com/tomiir)! - Fixes wrong wagmi authConnector name causing issues when merging multiple authConnectors

- [#2861](https://github.com/reown-com/appkit/pull/2861) [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates the localstorage keys

- Updated dependencies [[`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`48ad644`](https://github.com/reown-com/appkit/commit/48ad6444ca8f5a53cc2669e961492e62f32c0687), [`babb413`](https://github.com/reown-com/appkit/commit/babb4133ddff939061b788c3115b9d988b6e3ce2), [`a632159`](https://github.com/reown-com/appkit/commit/a6321595e4c910215e552119be69dc1486efb240), [`a181a19`](https://github.com/reown-com/appkit/commit/a181a19a017053df646e9ae6e1ffa77b1deac1d1)]:
  - @reown/appkit-wallet@1.0.2
  - @reown/appkit-core@1.0.2
  - @reown/appkit-common@1.0.2
  - @reown/appkit-polyfills@1.0.2

## 1.0.1

### Patch Changes

- [#54](https://github.com/WalletConnect/web3modal/pull/54) [`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09) Thanks [@tomiir](https://github.com/tomiir)! - Makes packages public

- Updated dependencies [[`dc6dd8d`](https://github.com/WalletConnect/web3modal/commit/dc6dd8d37cbe79ae3b0bcaf7bdace1fe6ad11b09)]:
  - @reown/appkit-common@1.0.1
  - @reown/appkit-core@1.0.1
  - @reown/appkit-polyfills@1.0.1
  - @reown/appkit-wallet@1.0.1

## 1.0.0

### Major Changes

- [#53](https://github.com/WalletConnect/web3modal/pull/53) [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a) Thanks [@tomiir](https://github.com/tomiir)! - Reown v1.0.0

### Patch Changes

- [#49](https://github.com/WalletConnect/web3modal/pull/49) [`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates prop names, adapter names, network exported path name

- [#52](https://github.com/WalletConnect/web3modal/pull/52) [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6) Thanks [@zoruka](https://github.com/zoruka)! - Fix network availability and wagmi reconnect

- Updated dependencies [[`e678965`](https://github.com/WalletConnect/web3modal/commit/e67896504762ea2220aaedb3202077eec83fdc7f), [`3d62df8`](https://github.com/WalletConnect/web3modal/commit/3d62df8e0f29977ee82f96f17fbbac66f39ae6a6), [`f4a378d`](https://github.com/WalletConnect/web3modal/commit/f4a378de8bf67f296ab5cc2d730533e7362ba36a)]:
  - @reown/appkit-core@1.0.0
  - @reown/appkit-common@1.0.0
  - @reown/appkit-polyfills@1.0.0
  - @reown/appkit-wallet@1.0.0

## 0.0.5

### Patch Changes

- [#45](https://github.com/WalletConnect/web3modal/pull/45) [`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates RPC urls project id query params dynamically

- [#46](https://github.com/WalletConnect/web3modal/pull/46) [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef) Thanks [@enesozturk](https://github.com/enesozturk)! - Updates sdk type and sdk version values

- [#42](https://github.com/WalletConnect/web3modal/pull/42) [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04) Thanks [@tomiir](https://github.com/tomiir)! - Fix circular dependency in OptionsController

- Updated dependencies [[`395398c`](https://github.com/WalletConnect/web3modal/commit/395398c7c943142776da2ea8011205e600d8ab86), [`756ab0d`](https://github.com/WalletConnect/web3modal/commit/756ab0d9f7b86abc6b1a4831197058176618d9ef), [`8c90093`](https://github.com/WalletConnect/web3modal/commit/8c90093f724dc1ba4e86f7101fac8772b58fae04)]:
  - @reown/appkit-common@0.0.5
  - @reown/appkit-core@0.0.5
  - @reown/appkit-polyfills@0.0.5
  - @reown/appkit-wallet@0.0.5

## 0.0.4

### Patch Changes

- [#38](https://github.com/WalletConnect/web3modal/pull/38) [`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b) Thanks [@tomiir](https://github.com/tomiir)! - Base reown package rename setup.

- Updated dependencies [[`89fb054`](https://github.com/WalletConnect/web3modal/commit/89fb054d7e2513b80940c73101dc395e7ea2694b)]:
  - @reown/appkit-polyfills@0.0.4
  - @reown/appkit-common@0.0.4
  - @reown/appkit-wallet@0.0.4
  - @reown/appkit-core@0.0.4

## 0.0.3

### Patch Changes

- [#28](https://github.com/WalletConnect/web3modal/pull/28) [`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797) Thanks [@tomiir](https://github.com/tomiir)! - Package setup. Reset Changelogs

- [#12](https://github.com/WalletConnect/web3modal/pull/12) [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a) Thanks [@tomiir](https://github.com/tomiir)! - Adds test vitest.workspace file

- Updated dependencies [[`91d0296`](https://github.com/WalletConnect/web3modal/commit/91d02963cbe3c2d06b74801b519ce23dd30ff797), [`51eff9f`](https://github.com/WalletConnect/web3modal/commit/51eff9f82c296b0ba2b5ab33af92a1fa54a77f7a)]:
  - @reown/appkit-common@0.0.3
  - @reown/appkit-core@0.0.3
  - @reown/appkit-polyfills@0.0.3
  - @reown/appkit-wallet@0.0.3
