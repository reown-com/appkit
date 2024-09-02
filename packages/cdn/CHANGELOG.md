# @web3modal/cdn

## 5.1.5

### Patch Changes

- - chore: add safety for localstorage by @zoruka in https://github.com/WalletConnect/web3modal/pull/2770
  - fix: impossible to press on send placeholder input on mobile by @magiziz in https://github.com/WalletConnect/web3modal/pull/2771
  - feat: solana sign all transactions by @zoruka in https://github.com/WalletConnect/web3modal/pull/2772
  - chore: change universal provider relay url and move to constants file by @zoruka in https://github.com/WalletConnect/web3modal/pull/2776
  - chore: remove coinbase SDK de-duplication by @tomiir in https://github.com/WalletConnect/web3modal/pull/2768
  - fix: add missing chainId param for transactions request by @zoruka in https://github.com/WalletConnect/web3modal/pull/2779
  - fix: remove coming message from solana transactions by @zoruka in https://github.com/WalletConnect/web3modal/pull/2780
- Updated dependencies []:
  - @web3modal/ethers@5.1.5
  - @web3modal/ethers5@5.1.5
  - @web3modal/wagmi@5.1.5

## 5.1.4

### Patch Changes

- - Added entries on assetlinks for flutter wallet by @quetool in https://github.com/WalletConnect/web3modal/pull/2746
  - chore: only upgrade ethers v6 by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2741
  - chore: fix wagmi not disconnecting and add adapter tests by @magiziz in https://github.com/WalletConnect/web3modal/pull/2751
  - Added more fingerprints to Flutter apps by @quetool in https://github.com/WalletConnect/web3modal/pull/2748
  - fix: remove auth connector from ethers and check for socials length by @tomiir in https://github.com/WalletConnect/web3modal/pull/2715
  - chore: make all socials enabled by default by @tomiir in https://github.com/WalletConnect/web3modal/pull/2747
  - fix: social logins not working in laboratory by @magiziz in https://github.com/WalletConnect/web3modal/pull/2765
  - chore: expose solana provider type by @zoruka in https://github.com/WalletConnect/web3modal/pull/2756
  - fix: Connector image mismatch by @tomiir in https://github.com/WalletConnect/web3modal/pull/2745
- Updated dependencies []:
  - @web3modal/ethers@5.1.4
  - @web3modal/ethers5@5.1.4
  - @web3modal/wagmi@5.1.4

## 5.1.3

### Patch Changes

- refactor: defaultChain ts mismatch, custom hooks, separation of dependencies

- Updated dependencies []:
  - @web3modal/ethers@5.1.3
  - @web3modal/ethers5@5.1.3
  - @web3modal/wagmi@5.1.3

## 5.1.2

### Patch Changes

- Added Solana Auth Provider types and schemas

- Updated dependencies []:
  - @web3modal/ethers@5.1.2
  - @web3modal/ethers5@5.1.2
  - @web3modal/wagmi@5.1.2

## 5.1.1

### Patch Changes

- Update EthProvider to v 2.15.1

- Updated dependencies []:
  - @web3modal/ethers@5.1.1
  - @web3modal/wagmi@5.1.1

## 5.1.0

### Minor Changes

Enhanced compatibility, performance, developer experience, and user interface updates across various features

- fix: remove limitation on sending versioned tx by @tomiir in https://github.com/WalletConnect/web3modal/pull/2638
- refactor: fix missing ens screens by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2639
- chore: remove non-Blockchain API RPCs by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2640
- chore: update wagmi dependencies to latest version by @tomiir in https://github.com/WalletConnect/web3modal/pull/2642
- chore: dynamic metadata URL by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2628
- add icons and wallets by @glitch-txs in https://github.com/WalletConnect/web3modal/pull/2637
- chore: fix playwright tests by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2633
- chore: more renovate by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2619
- chore: test single retry in tests by @tomiir in https://github.com/WalletConnect/web3modal/pull/2648
- feat/automated tests with metamask by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2636
- fix: import types from the package root in partials by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2650
- feat: add support for eip5792 getCapabilities and sendCalls by @tomiir in https://github.com/WalletConnect/web3modal/pull/2576
- chore: ID allocation service by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2574
- refactor: solana sign and send transaction by @zoruka in https://github.com/WalletConnect/web3modal/pull/2646
- chore: renovate updates by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2673
- fix(solana): injected connectors not detected by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2656
- chore: fix renovate includePaths by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2674
- chore: update lab names & images by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2653
- chore: fix typo by @riyueguang in https://github.com/WalletConnect/web3modal/pull/2600
- refactor: handle balance and balanceSymbol fetch to update w3m-button by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2433
- added filter transactions by chain by @glitch-txs in https://github.com/WalletConnect/web3modal/pull/1834
- refactor/wallet card item with image optimization by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2572
- fix: small balance format by @imlonghao in https://github.com/WalletConnect/web3modal/pull/2651
- feat: add git hooks with husky and add pre-push hook by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2558
- fix: add getApprovedCaipNetworks implementation by @tomiir in https://github.com/WalletConnect/web3modal/pull/2644
- chore: update vitest to v2 by @tomiir in https://github.com/WalletConnect/web3modal/pull/2678
- feat: add sender to identity and reverse resolution by @tomiir in https://github.com/WalletConnect/web3modal/pull/2649
- refactor: solana walletconnect rpc interface by @zoruka in https://github.com/WalletConnect/web3modal/pull/2677
- Wagmi: Erc7715 permissions with Appkit embedded wallet by @KannuSingh in https://github.com/WalletConnect/web3modal/pull/2615
- fix issue with modal not closing by @KannuSingh in https://github.com/WalletConnect/web3modal/pull/2680
- fix: wagmi not showing loading indicator on email reconnection by @tomiir in https://github.com/WalletConnect/web3modal/pull/2682
- fix: ethers disconnection error by @tomiir in https://github.com/WalletConnect/web3modal/pull/2683
- fix: Wagmi Switch To by @tomiir in https://github.com/WalletConnect/web3modal/pull/2679
- refactor: improvements to siwe flow and modal animations by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2672
- chore: added rn samples in apple file by @ignaciosantise in https://github.com/WalletConnect/web3modal/pull/2687
- chore: Web3Modal -> AppKit by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2686
- chore: fix metadata icon by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2685
- fix(multi-account): account switch on wagmi by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2689
- Added Flutter universal links by @quetool in https://github.com/WalletConnect/web3modal/pull/2695
- feat: add bundle size check by @lukaisailovic in https://github.com/WalletConnect/web3modal/pull/2694
- chore: remove unnecessary window.postMessage for W3mFrame by @zoruka in https://github.com/WalletConnect/web3modal/pull/2658
- refactor: standardize solana provider adapters by @zoruka in https://github.com/WalletConnect/web3modal/pull/2690
- fix: bring back old parameters for RPC call on solana_signTransaction by @zoruka in https://github.com/WalletConnect/web3modal/pull/2692
- refactor: export missing type defs from siwe package by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2703
- fix: solana qa round by @zoruka in https://github.com/WalletConnect/web3modal/pull/2704
- chore: update with latest V5 changes by @svenvoskamp in https://github.com/WalletConnect/web3modal/pull/2635
- fix(deps): update walletconnect to v2.15.0 by @renovate in https://github.com/WalletConnect/web3modal/pull/2675
- chore(deps): update wagmi by @renovate in https://github.com/WalletConnect/web3modal/pull/2676
- chore: URL on lab pages by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2702
- chore: update vite-size to 0.0.5 by @lukaisailovic in https://github.com/WalletConnect/web3modal/pull/2700
- chore: change chainId type to accept string and its dependencies by @zoruka in https://github.com/WalletConnect/web3modal/pull/2632
- fix(deps): update dependency @solana/web3.js to v1.95.2 by @renovate in https://github.com/WalletConnect/web3modal/pull/2312

### New Contributors

- @riyueguang made their first contribution in https://github.com/WalletConnect/web3modal/pull/2600
- @imlonghao made their first contribution in https://github.com/WalletConnect/web3modal/pull/2651
- @quetool made their first contribution in https://github.com/WalletConnect/web3modal/pull/2695

**Full Changelog**: https://github.com/WalletConnect/web3modal/compare/5.0.11...5.1.0

### Patch Changes

- Updated dependencies []:
  - @web3modal/ethers@5.1.0
  - @web3modal/wagmi@5.1.0

## 5.0.11

### Patch Changes

- - Hotfix to prevent loading state with QR code

- Updated dependencies []:
  - @web3modal/ethers@5.0.11
  - @web3modal/wagmi@5.0.11

## 5.0.10

- chore: update with v5 by @tomiir in https://github.com/WalletConnect/web3modal/pull/2612
- fix: move the wagmi state mutation to outside of 1-click auth flow by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2585
- :hotfix fix svg error when requesting farcaster qr code by @svenvoskamp in https://github.com/WalletConnect/web3modal/pull/2621

**Full Changelog**: https://github.com/WalletConnect/web3modal/compare/5.0.9...5.0.10

- Updated dependencies []:
  - @web3modal/ethers@5.0.10
  - @web3modal/wagmi@5.0.10

## 5.0.9

### Patch Changes

- - chore: refine link names by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2588
  - hotfix change secure site origin domain to .org by @svenvoskamp in https://github.com/WalletConnect/web3modal/pull/2603

**Full Changelog**: https://github.com/WalletConnect/web3modal/compare/5.0.8...5.0.9

## 5.0.8

### Patch Changes

- - chore: lab loading indicator by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2548
  - fix: not allow multiple account syncs for same caip address by @zoruka in https://github.com/WalletConnect/web3modal/pull/2547
  - fix: missing network not supported modal on wallet network switch by @zoruka in https://github.com/WalletConnect/web3modal/pull/2565
  - chore: add clientId to BlockchainAPI requests by @tomiir in https://github.com/WalletConnect/web3modal/pull/2521
  - Chore/split internal external testing by @svenvoskamp in https://github.com/WalletConnect/web3modal/pull/2563
  - fix: remove 200ms QR delay by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2567
  - [TDW] move from npm to pnpm by @segunadebayo in https://github.com/WalletConnect/web3modal/pull/2545
  - feat: enableSwaps option by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2573
  - build: fix dockerfile and bring back turbo by @segunadebayo in https://github.com/WalletConnect/web3modal/pull/2582
  - chore: updates providers to `2.14` by @ganchoradkov in https://github.com/WalletConnect/web3modal/pull/2557
  - fix: gets chains from approved accounts by @ganchoradkov in https://github.com/WalletConnect/web3modal/pull/2562
  - :fix show right icon for multi-address account by @svenvoskamp in https://github.com/WalletConnect/web3modal/pull/2560
  - feat: add wallet features and socials github tests by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2571
  - fix: multiple account syncs on wagmi by @zoruka in https://github.com/WalletConnect/web3modal/pull/2575
  - feat: apply RPC refactor and EIP5792 schema changes by @tomiir in https://github.com/WalletConnect/web3modal/pull/2580
  - refactor: turbo pipeline by @segunadebayo in https://github.com/WalletConnect/web3modal/pull/2587

  **Full Changelog**: https://github.com/WalletConnect/web3modal/compare/5.0.7...5.0.8

- Updated dependencies []:
  - @web3modal/ethers@5.0.8
  - @web3modal/wagmi@5.0.8

## 5.0.7

### Patch Changes

- - feat: multi address by @ganchoradkov in https://github.com/WalletConnect/web3modal/pull/2286
  - feat: feat: added vue for exports in solana by @phoenixVS in https://github.com/WalletConnect/web3modal/pull/2449
  - fix: wagmi authConnector connectExternal resolving issue and enable wagmi email tests by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2504
  - chore: configures report-only CSP for lab by @bkrem in https://github.com/WalletConnect/web3modal/pull/2388
  - fix: settings btn styling by @ganchoradkov in https://github.com/WalletConnect/web3modal/pull/2523
  - Add Wallet Standard to AppKit + Solana by @glitch-txs in https://github.com/WalletConnect/web3modal/pull/2482
  - chore: remove onramp widget from labs by @tomiir in https://github.com/WalletConnect/web3modal/pull/2526
  - feat: support custom connectors by @chris13524 in https://github.com/WalletConnect/web3modal/pull/2119
  - fix: disconnect logic for EIP6963 & Injected provider types for @web3modal/ethers by @hmzakhalid in https://github.com/WalletConnect/web3modal/pull/2289
  - Feat ERC7715 grant_permissions support on lab by @KannuSingh in https://github.com/WalletConnect/web3modal/pull/2500
  - update chain on network change by @glitch-txs in https://github.com/WalletConnect/web3modal/pull/2497
  - fix: make accounts optional in social response by @tomiir in https://github.com/WalletConnect/web3modal/pull/2520
  - chore: SA Tests switch network before flow by @tomiir in https://github.com/WalletConnect/web3modal/pull/2529
  - chore: changed react native universal links by @ignaciosantise in https://github.com/WalletConnect/web3modal/pull/2535
  - chore: change labs' ethers rpc urls to walletconnect.org by @tomiir in https://github.com/WalletConnect/web3modal/pull/2530
  - chore: remove 'no-cache' from API requests by @tomiir in https://github.com/WalletConnect/web3modal/pull/2538
  - fix: makes `getMessageParams` siwe client method optional by @ganchoradkov in https://github.com/WalletConnect/web3modal/pull/2305
  - chore: update secure site url to org domain by @tomiir in https://github.com/WalletConnect/web3modal/pull/2537
  - fix: multiple name by @tomiir in https://github.com/WalletConnect/web3modal/pull/2410
  - refactor(common): utils by @Simon-He95 in https://github.com/WalletConnect/web3modal/pull/2447
  - fix: reorder chains to have current chain Id as main message by @tomiir in https://github.com/WalletConnect/web3modal/pull/2423
  - refactor: change solana testnet and devnet rpcs to wc by @enesozturk in https://github.com/WalletConnect/web3modal/pull/2541
  - refactor: laboratory wagmi tests by @zoruka in https://github.com/WalletConnect/web3modal/pull/2552
  - fix: sync accounts in wagmi and subscribe to account change by @tomiir in https://github.com/WalletConnect/web3modal/pull/2544
- Updated dependencies []:
  - @web3modal/ethers@5.0.7
  - @web3modal/wagmi@5.0.7

## 5.0.6

### Patch Changes

- fix: Social Login illegal invocation issue. Wagmi tests

- Updated dependencies []:
  - @web3modal/ethers@5.0.6
  - @web3modal/wagmi@5.0.6

## 5.0.5

### Patch Changes

- feat: universal link internal flag. Add kotlin assetlinks. Fix email truncation'

- Updated dependencies []:
  - @web3modal/ethers@5.0.5
  - @web3modal/wagmi@5.0.5

## 5.0.4

### Patch Changes

- fix: wcPromise incompatibility issues

- Updated dependencies []:
  - @web3modal/ethers@5.0.4
  - @web3modal/wagmi@5.0.4

## 5.0.3

### Patch Changes

- fix: ethers5 coinbase issues. Turbo build issues. Upate cb connector.

- Updated dependencies []:
  - @web3modal/ethers@5.0.3
  - @web3modal/wagmi@5.0.3

## 5.0.2

### Patch Changes

- fix: siwe signOutOnNetwork change issue. fix: wallets filtered by rdns matched from explorer api. fix: solana network id issue

- Updated dependencies []:
  - @web3modal/ethers@5.0.2
  - @web3modal/wagmi@5.0.2

## 5.0.1

### Patch Changes

- fix: remove walletconnect restriction on names

- Updated dependencies []:
  - @web3modal/ethers@5.0.1
  - @web3modal/wagmi@5.0.1

## 5.0.0

### Major Changes

- Release V5

### Patch Changes

- Updated dependencies []:
  - @web3modal/ethers@5.0.0
  - @web3modal/wagmi@5.0.0

## 5.0.0-cn-v5.0

### Major Changes

- Test V5

### Patch Changes

- Updated dependencies []:
  - @web3modal/ethers@5.0.0-cn-v5.0
  - @web3modal/wagmi@5.0.0-cn-v5.0
