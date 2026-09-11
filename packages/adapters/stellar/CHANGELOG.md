# @reown/appkit-adapter-stellar

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
