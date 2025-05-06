# @reown/appkit-pay

## 1.6.10

### Patch Changes

- [#4296](https://github.com/reown-com/appkit/pull/4296) [`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Fixes an issue where social login was not working in PWA environments

- [#4281](https://github.com/reown-com/appkit/pull/4281) [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7) Thanks [@magiziz](https://github.com/magiziz)! - Added cosmos namespace

- [#4287](https://github.com/reown-com/appkit/pull/4287) [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where embeddedWalletInfo would be populated even when connected to non-embedded wallets

- [#4260](https://github.com/reown-com/appkit/pull/4260) [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where Receive screen would show networks from other namespaces

- [#4279](https://github.com/reown-com/appkit/pull/4279) [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades sats-connect for network switching while connecting

- [#4299](https://github.com/reown-com/appkit/pull/4299) [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where deep links on mobile were not working properly

- [#4288](https://github.com/reown-com/appkit/pull/4288) [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where walletInfo would not be set on initial connection

- [#4291](https://github.com/reown-com/appkit/pull/4291) [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Open loading screen from the secure site for better UX in stead of opening blank screen

- [#4297](https://github.com/reown-com/appkit/pull/4297) [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542) Thanks [@svenvoskamp](https://github.com/svenvoskamp)! - Solely use the BlockChain API to make ENS calls. Removed all the adapter specific logic to retrieve the ENS name, address and avatar

- [#4283](https://github.com/reown-com/appkit/pull/4283) [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where the "Get Started" button appeared in the connect view when both email and socials were disabled

- [#4292](https://github.com/reown-com/appkit/pull/4292) [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93) Thanks [@enesozturk](https://github.com/enesozturk)! - Upgrades WalletConnect dependencies to 2.20.x

- [#4290](https://github.com/reown-com/appkit/pull/4290) [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b) Thanks [@enesozturk](https://github.com/enesozturk)! - Removes gas estimations from swap inputs and calculations

- Updated dependencies [[`70e0da4`](https://github.com/reown-com/appkit/commit/70e0da4889822b74fb81fc94fa48c5bd1340cbef), [`f2f1b72`](https://github.com/reown-com/appkit/commit/f2f1b72387a7658abd6e8c3061c51e9811e8ce69), [`ce17d19`](https://github.com/reown-com/appkit/commit/ce17d19a7e26eb3bc1de7ecd4928dedef6b99c66), [`00caf22`](https://github.com/reown-com/appkit/commit/00caf227b84476ab45e317b48f8a31bd14e48e78), [`30a9e1b`](https://github.com/reown-com/appkit/commit/30a9e1bbc5978a2cac63cf46af89aa3c34ad24c7), [`f91ec17`](https://github.com/reown-com/appkit/commit/f91ec1770fdada058a658b62bd3f8f7bea00322e), [`531da97`](https://github.com/reown-com/appkit/commit/531da979c89c3727ac3e190f709c6bd2dba8215c), [`84a2cff`](https://github.com/reown-com/appkit/commit/84a2cff2e671ada649ef3902c9da90bad09a65e2), [`f6bddff`](https://github.com/reown-com/appkit/commit/f6bddffe8cea2d6696a6dd98ec8a57c17c6a02ac), [`bc0f260`](https://github.com/reown-com/appkit/commit/bc0f260beac036571c6e820953e69d14e087048b), [`4aeb703`](https://github.com/reown-com/appkit/commit/4aeb703fc5bc44cfc6cb34b43758eb3fbb8ab005), [`f8c8f7f`](https://github.com/reown-com/appkit/commit/f8c8f7f234b57afdc9d93ca6b36f366ebf704b85), [`04b770d`](https://github.com/reown-com/appkit/commit/04b770dae74af95638edd280d725228df4280efa), [`246d9c4`](https://github.com/reown-com/appkit/commit/246d9c49e1c7b5ae6db5fd9a537ff9cd508cafca), [`b3a0b05`](https://github.com/reown-com/appkit/commit/b3a0b05c73b12a24685dd3c9b1b0a86b59c54c27), [`59e0034`](https://github.com/reown-com/appkit/commit/59e00347fb3a431a0a7c2eb59850469e47e93440), [`a775335`](https://github.com/reown-com/appkit/commit/a775335b37e2080b3a181e57ccafda3dd196b836), [`4e4879e`](https://github.com/reown-com/appkit/commit/4e4879e12285c84050e2441f323534be5883c542), [`f073d75`](https://github.com/reown-com/appkit/commit/f073d75adf726a4c137052f16d71b19389fcc3ce), [`f220a62`](https://github.com/reown-com/appkit/commit/f220a62751137168af47b0a55e8a7579beb12e93), [`fae99c0`](https://github.com/reown-com/appkit/commit/fae99c0c160d62ca4e87716dedc91de2c4fdbd4e), [`c205d9f`](https://github.com/reown-com/appkit/commit/c205d9fb3b21ac1673d594634add54fb7cff888b)]:
  - @reown/appkit-controllers@1.7.4
  - @reown/appkit-utils@1.7.4
  - @reown/appkit-common@1.7.4
  - @reown/appkit-ui@1.7.4
