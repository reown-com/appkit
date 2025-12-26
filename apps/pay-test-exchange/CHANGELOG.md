# pay-test-exchange

## 0.1.18

### Patch Changes

- [#5296](https://github.com/reown-com/appkit/pull/5296) [`bc4a961`](https://github.com/reown-com/appkit/commit/bc4a961b448cedd0a8485a2188549b413b4e6512) Thanks [@magiziz](https://github.com/magiziz)! - Improved wallet search to filter out non-walletconnect and walletconnect wallets based on platform and SDK type

## 0.1.17

### Patch Changes

- [#5274](https://github.com/reown-com/appkit/pull/5274) [`100ee2b`](https://github.com/reown-com/appkit/commit/100ee2bf54f9036e72e5961300e0b3edb8089239) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where remote config endpoint was being called when using appkit core

## 0.1.16

### Patch Changes

- [#5247](https://github.com/reown-com/appkit/pull/5247) [`99cc58b`](https://github.com/reown-com/appkit/commit/99cc58bb335a359b261eab18676fed13ea325bde) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes package version injecting when building packages

- [#5225](https://github.com/reown-com/appkit/pull/5225) [`fda02dc`](https://github.com/reown-com/appkit/commit/fda02dc9ee173ff34f604dc6b022f421bae44539) Thanks [@magiziz](https://github.com/magiziz)! - Added usage limit UI in AppKit that displays when limits are exceeded

## 0.1.15

### Patch Changes

- [#5148](https://github.com/reown-com/appkit/pull/5148) [`bdce2c8`](https://github.com/reown-com/appkit/commit/bdce2c8dfa58bed7bd5f8114574c2db751e9bdd3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where social login did not work with wallet button

## 0.1.14

### Patch Changes

- [#5100](https://github.com/reown-com/appkit/pull/5100) [`6ba0dac`](https://github.com/reown-com/appkit/commit/6ba0dac506cbd4457034a13067207c5c6231e853) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades Viem, Wagmi, WC, Solana and some other dependencies to latest

- [#5098](https://github.com/reown-com/appkit/pull/5098) [`10cfb56`](https://github.com/reown-com/appkit/commit/10cfb56fc940e6d0371918ba8fb8f29692523fc0) Thanks [@magiziz](https://github.com/magiziz)! - Added `getDisabledCaipNetworks` to AppKit to get disabled caip networks

## 0.1.13

### Patch Changes

- [#5079](https://github.com/reown-com/appkit/pull/5079) [`511a735`](https://github.com/reown-com/appkit/commit/511a73590a834a6f81bda675d9a740a4d61924d7) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the universal provider threw a random object error when the wallet rejected connection request

- [#5078](https://github.com/reown-com/appkit/pull/5078) [`a0a1589`](https://github.com/reown-com/appkit/commit/a0a1589acfe3e92030fd85589fab961e4ea85b1d) Thanks [@magiziz](https://github.com/magiziz)! - Added chain image to token button component for the deposit from exchange view

- [#4959](https://github.com/reown-com/appkit/pull/4959) [`5725b51`](https://github.com/reown-com/appkit/commit/5725b5100ba71bba47173dc5f6318cb857afec9d) Thanks [@magiziz](https://github.com/magiziz)! - Improved the send flow with improved design and added top-up options for users with insufficient token balances

- [#5074](https://github.com/reown-com/appkit/pull/5074) [`216596d`](https://github.com/reown-com/appkit/commit/216596d01128aca0629346b75ac256ea3db7a391) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fix an issue where the wallets would show a small glitch when rendering the connectors

## 0.1.12

### Patch Changes

- [#5043](https://github.com/reown-com/appkit/pull/5043) [`1fe278b`](https://github.com/reown-com/appkit/commit/1fe278b757e08660dffb1fc2fae64ad34be04db4) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `useAppKitConnection` hook returned `null` when wallet is disconnected

- [#5028](https://github.com/reown-com/appkit/pull/5028) [`090dbb5`](https://github.com/reown-com/appkit/commit/090dbb53dce58663f6a025d360156ab38c76f886) Thanks [@magiziz](https://github.com/magiziz)! - Removed NFTs tab from account modal view

- [#5048](https://github.com/reown-com/appkit/pull/5048) [`9b2154c`](https://github.com/reown-com/appkit/commit/9b2154c069c554a45ed0f155bdda096f03d6649c) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the `publicKey` was returning `undefined` when connecting with the OKX Bitcoin wallet

- [#5065](https://github.com/reown-com/appkit/pull/5065) [`fde8e5d`](https://github.com/reown-com/appkit/commit/fde8e5d6b0145b1729316ad03d9e9b18fdaf0b97) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix an issue where the wallets would show a small glitch when rendering the connectors

- [#5021](https://github.com/reown-com/appkit/pull/5021) [`05ed5d2`](https://github.com/reown-com/appkit/commit/05ed5d231e53622dde33ecf66e694d85ad411e65) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where a `SEND_ERROR` event was logged when a user rejected a transaction. It now logs a `SEND_REJECTED` event instead

## 0.1.11

### Patch Changes

- [#5030](https://github.com/reown-com/appkit/pull/5030) [`a6779f5`](https://github.com/reown-com/appkit/commit/a6779f5143e1f788450814efcf5beadf8573214a) Thanks [@magiziz](https://github.com/magiziz)! - Added `walletRank` property to the `CONNECT_SUCCESS` event and created a new `@appkit/recent_wallet` local storage key to track the most recently connected wallet

- [#4936](https://github.com/reown-com/appkit/pull/4936) [`0bf1921`](https://github.com/reown-com/appkit/commit/0bf192130f857d395135e5d740328fd1419412bd) Thanks [@ganchoradkov](https://github.com/ganchoradkov)! - Enhanced connection UX by allowing scanning of QR code with main device camera and prompting the target wallet

## 0.1.10

### Patch Changes

- [#5004](https://github.com/reown-com/appkit/pull/5004) [`21f7512`](https://github.com/reown-com/appkit/commit/21f7512914f525f9a55b718cc7c2f4b08e7e7cfa) Thanks [@magiziz](https://github.com/magiziz)! - Added new functionality that allows users to manually edit the deposit amount on the deposit from exchange screen

- [#4982](https://github.com/reown-com/appkit/pull/4982) [`f58c0b4`](https://github.com/reown-com/appkit/commit/f58c0b4d39883ff2bd04eefc6b3b9eb05a6b7bb6) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the question mark icon in the header was not displayed correctly

- [#4992](https://github.com/reown-com/appkit/pull/4992) [`2d27d48`](https://github.com/reown-com/appkit/commit/2d27d480f761e697a14929ba0c687187fd624c3d) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where upon user connection rejection a `CONNECT_ERROR` event was logged. It now logs a new event error called `USER_REJECTED`

## 0.1.9

### Patch Changes

- [#4979](https://github.com/reown-com/appkit/pull/4979) [`75dfdbd`](https://github.com/reown-com/appkit/commit/75dfdbda65d1a6d491a866015669da39e013a810) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where using the `open` function with send arguments and attempting to switch networks did not throw, causing the network state to become inconsistent

- [#4965](https://github.com/reown-com/appkit/pull/4965) [`120b141`](https://github.com/reown-com/appkit/commit/120b1410986c787af0ae15094b02adfee8621efd) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the wallet icon from the SIWX screen was not properly rendered on Safari

- [`8e051a4`](https://github.com/reown-com/appkit/commit/8e051a431fbc6d2d386ceb3c1d2764991b0aece1) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the question mark icon in the header was not displayed correctly

- [#4968](https://github.com/reown-com/appkit/pull/4968) [`504fe04`](https://github.com/reown-com/appkit/commit/504fe04237e8213a39bc7dce42db6175829f38b3) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the send input field did not include number pattern validation when typing characters

- [#4962](https://github.com/reown-com/appkit/pull/4962) [`197dcbf`](https://github.com/reown-com/appkit/commit/197dcbf7a0d1ff89e1e820766714cef2acf1eb17) Thanks [@magiziz](https://github.com/magiziz)! - Added send arguments to `open` function to customize the send flow experience by pre-configuring the token, amount, chain, and recipient address

## 0.1.8

### Patch Changes

- [#4872](https://github.com/reown-com/appkit/pull/4872) [`8ba484f`](https://github.com/reown-com/appkit/commit/8ba484fa97d2da0ca721b05407a4cc439437e16f) Thanks [@zoruka](https://github.com/zoruka)! - Fix filtering of wallets on ApiController to allow webapp wallets in mobile.

- [#4941](https://github.com/reown-com/appkit/pull/4941) [`721bfcf`](https://github.com/reown-com/appkit/commit/721bfcf90e5d5e7d425d989f3e9a313373e40747) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where funding from the exchange did not work on the first attempt

- [#4957](https://github.com/reown-com/appkit/pull/4957) [`5595d17`](https://github.com/reown-com/appkit/commit/5595d1785821170e301ea4966994419a4cbb21cc) Thanks [@magiziz](https://github.com/magiziz)! - Replaced "deposit from an exchange" to "deposit from exchange" in appkit header

- [#4934](https://github.com/reown-com/appkit/pull/4934) [`6e465c5`](https://github.com/reown-com/appkit/commit/6e465c5f6aaf10c64bc99968f4d3970ecb77831e) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

## 0.1.7

### Patch Changes

- [#4923](https://github.com/reown-com/appkit/pull/4923) [`b6adfdc`](https://github.com/reown-com/appkit/commit/b6adfdc1713daefb63393d9fa3a2cb2e31ba00e2) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed an issue where Solana token-2022 token transfers failed because the send flow used legacy transfer instructions

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
