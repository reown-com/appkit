# @reown/appkit-adapter-bitcoin

## 1.6.3

### Patch Changes

- [#3530](https://github.com/reown-com/appkit/pull/3530) [`295f320`](https://github.com/reown-com/appkit/commit/295f320b133b5bd605f9c9a89441935a2471f1ec) Thanks [@magiziz](https://github.com/magiziz)! - Updated account modal to redirect to the settings view instead of the profile view when only one social/email account is connected

- [#3528](https://github.com/reown-com/appkit/pull/3528) [`a3dae62`](https://github.com/reown-com/appkit/commit/a3dae620d7f5209ca496ada6491eced3f0e5391c) Thanks [@magiziz](https://github.com/magiziz)! - Added a new option to enable or disable logs from email/social login.

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

- [#3522](https://github.com/reown-com/appkit/pull/3522) [`39616f5`](https://github.com/reown-com/appkit/commit/39616f5efb6f5af17ef716aca2383597cd98fdde) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes `signOutOnNetworkChange` and `signOutOnAccountChange` flags on SIWX mapper function to work as expected

- [#3541](https://github.com/reown-com/appkit/pull/3541) [`fc80119`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue with WC connections on wallets that do not support a requested network. Sets default network to first one supported by wallet

- [#3541](https://github.com/reown-com/appkit/pull/3541) [`fc80119`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d) Thanks [@tomiir](https://github.com/tomiir)! - Improves existing connection error handling'

- [#3534](https://github.com/reown-com/appkit/pull/3534) [`e946c97`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where disconnecting the injected wallet did not update the state as disconnected for ethers/ethers5 adapters

- [#3531](https://github.com/reown-com/appkit/pull/3531) [`aa24c91`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed) Thanks [@tomiir](https://github.com/tomiir)! - Adds loading while disconnecting

- [#3535](https://github.com/reown-com/appkit/pull/3535) [`e6fc980`](https://github.com/reown-com/appkit/commit/e6fc9800039984e3150c38a4c4cbd7214d07742c) Thanks [@tomiir](https://github.com/tomiir)! - Fixes issue where refreshing the page when connected to multiple namespaces would only reconnect the last active one

- [#3537](https://github.com/reown-com/appkit/pull/3537) [`7e19dae`](https://github.com/reown-com/appkit/commit/7e19daeaf93c48338f1f7b5dc5de5a271ae8f643) Thanks [@enesozturk](https://github.com/enesozturk)! - Fixes Vue hooks to return reactive values

- [#3533](https://github.com/reown-com/appkit/pull/3533) [`af58b49`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where an incorrect EOA label and icon were displayed in the profile view after reconnecting through social/email login

- [#3521](https://github.com/reown-com/appkit/pull/3521) [`60c1715`](https://github.com/reown-com/appkit/commit/60c17150bb29765bfc88e0f522484e59c3bdd1fe) Thanks [@zoruka](https://github.com/zoruka)! - Set connected wallet info when going to authenticate flow.

- [#3549](https://github.com/reown-com/appkit/pull/3549) [`4d25c1d`](https://github.com/reown-com/appkit/commit/4d25c1d7986a2b9b0128d3c250e750c60b619cc0) Thanks [@tomiir](https://github.com/tomiir)! - Updates @solana/web3.js dependency to latest

- Updated dependencies [[`295f320`](https://github.com/reown-com/appkit/commit/295f320b133b5bd605f9c9a89441935a2471f1ec), [`a3dae62`](https://github.com/reown-com/appkit/commit/a3dae620d7f5209ca496ada6491eced3f0e5391c), [`8569d56`](https://github.com/reown-com/appkit/commit/8569d56a3c6ab41833c7ef6a21712afee4bbcec0), [`39616f5`](https://github.com/reown-com/appkit/commit/39616f5efb6f5af17ef716aca2383597cd98fdde), [`fc80119`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d), [`0735f15`](https://github.com/reown-com/appkit/commit/0735f15c65b5de397dd856004f197f2ec07538f9), [`fc80119`](https://github.com/reown-com/appkit/commit/fc80119c3c709288d231603c5157b8078151520d), [`e946c97`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354), [`aa24c91`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed), [`e6fc980`](https://github.com/reown-com/appkit/commit/e6fc9800039984e3150c38a4c4cbd7214d07742c), [`d3ecccb`](https://github.com/reown-com/appkit/commit/d3ecccbbde0d40a27f2b261a3d99b15ab83149da), [`7e19dae`](https://github.com/reown-com/appkit/commit/7e19daeaf93c48338f1f7b5dc5de5a271ae8f643), [`af58b49`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a), [`60c1715`](https://github.com/reown-com/appkit/commit/60c17150bb29765bfc88e0f522484e59c3bdd1fe), [`4d25c1d`](https://github.com/reown-com/appkit/commit/4d25c1d7986a2b9b0128d3c250e750c60b619cc0), [`7459461`](https://github.com/reown-com/appkit/commit/7459461eed6786a17c251c40aab153572ecda45f)]:
  - @reown/appkit@1.6.3
  - @reown/appkit-common@1.6.3
  - @reown/appkit-core@1.6.3

## 1.6.2

### Patch Changes

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
  - @reown/appkit@1.6.2
  - @reown/appkit-common@1.6.2
  - @reown/appkit-core@1.6.2

## 1.6.1

### Patch Changes

- [#3505](https://github.com/reown-com/appkit/pull/3505) [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d) Thanks [@tomiir](https://github.com/tomiir)! - Makes bitcoin adapter public

- Updated dependencies [[`ee9b40e`](https://github.com/reown-com/appkit/commit/ee9b40e0bc7018a6c76199a3285a418356d90759), [`f83d09c`](https://github.com/reown-com/appkit/commit/f83d09c94e810d4abe830c6065f905b9237ef120), [`edc7a17`](https://github.com/reown-com/appkit/commit/edc7a17879fa54c1257aa985c833ce48af9c2144), [`e5a09bc`](https://github.com/reown-com/appkit/commit/e5a09bc20844b0e010a273eff12c3a31ca74c220), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`85c858f`](https://github.com/reown-com/appkit/commit/85c858f7191d6210b0ef900fb4fb1112b09f466c), [`3cf3bc5`](https://github.com/reown-com/appkit/commit/3cf3bc5501f64eb7f569716398d45fc8fa89a771), [`92ef6c4`](https://github.com/reown-com/appkit/commit/92ef6c4bfe56c67eedfcf6060ccbf87891ce3468), [`e18eefe`](https://github.com/reown-com/appkit/commit/e18eefe339aab5d02743faee26b0aac0f624b678), [`7b91225`](https://github.com/reown-com/appkit/commit/7b9122520b2ed0cf5d7a4fb0b160bfa4c23c2b58), [`444d1dd`](https://github.com/reown-com/appkit/commit/444d1dd2c6216f47bcf32c98551e5c4338d872c5), [`0f55885`](https://github.com/reown-com/appkit/commit/0f55885520775652ae7bc42b83e20b03d3b4ad31), [`ce5207f`](https://github.com/reown-com/appkit/commit/ce5207f902d3257d0780e6ae78dfe25e5a870a01), [`31b87fc`](https://github.com/reown-com/appkit/commit/31b87fcc5c252f69dc35de9b1fb2ddab5b7b208d), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`11b3e2e`](https://github.com/reown-com/appkit/commit/11b3e2ed386eb0fa4ccc203fb6b83459a188b5d2), [`8fa4632`](https://github.com/reown-com/appkit/commit/8fa46321ef6cb265423cc9b2dc9369de461cbbfc), [`56b66f4`](https://github.com/reown-com/appkit/commit/56b66f4cb60dc7fd9b72c2cb85b434f7f2917871), [`14af422`](https://github.com/reown-com/appkit/commit/14af422e7eee14a13601e903dee61655485babd9), [`a737ca3`](https://github.com/reown-com/appkit/commit/a737ca3b20714a0c89fc6620ce1fed3602a02796), [`69fcf27`](https://github.com/reown-com/appkit/commit/69fcf27c56db900554eacced0b1725c3060ed781), [`fccbd31`](https://github.com/reown-com/appkit/commit/fccbd31be0a6ed550468f2049413ee7cdf0d64b8), [`a9d7686`](https://github.com/reown-com/appkit/commit/a9d7686eac8a95d8a1235504a302e8ae153ebf5d), [`8249314`](https://github.com/reown-com/appkit/commit/824931426721b02e4cc7474066f54916aaf29dcf), [`6cc4cdd`](https://github.com/reown-com/appkit/commit/6cc4cdd91749693d83c5da90e19fe34979834925), [`ea1067a`](https://github.com/reown-com/appkit/commit/ea1067aff3086c68dfe5f4f33eac5fb6b882bbde), [`c1a641f`](https://github.com/reown-com/appkit/commit/c1a641fb5cc34f84d97535006d698efd3e563036)]:
  - @reown/appkit@1.6.1
  - @reown/appkit-core@1.6.1
  - @reown/appkit-common@1.6.1
