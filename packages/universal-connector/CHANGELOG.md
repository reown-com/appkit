# @reown/appkit-universal-connector

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
