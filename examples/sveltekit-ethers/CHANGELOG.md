# sveltekit-ethers

## 0.0.2

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

- [#3534](https://github.com/reown-com/appkit/pull/3534) [`e946c97`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where disconnecting the injected wallet did not update the state as disconnected for ethers/ethers5 adapters

- [#3531](https://github.com/reown-com/appkit/pull/3531) [`aa24c91`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed) Thanks [@tomiir](https://github.com/tomiir)! - Adds loading while disconnecting

- [#3533](https://github.com/reown-com/appkit/pull/3533) [`af58b49`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a) Thanks [@magiziz](https://github.com/magiziz)! - Fixed an issue where an incorrect EOA label and icon were displayed in the profile view after reconnecting through social/email login

- [#3521](https://github.com/reown-com/appkit/pull/3521) [`60c1715`](https://github.com/reown-com/appkit/commit/60c17150bb29765bfc88e0f522484e59c3bdd1fe) Thanks [@zoruka](https://github.com/zoruka)! - Set connected wallet info when going to authenticate flow.

- Updated dependencies [[`295f320`](https://github.com/reown-com/appkit/commit/295f320b133b5bd605f9c9a89441935a2471f1ec), [`a3dae62`](https://github.com/reown-com/appkit/commit/a3dae620d7f5209ca496ada6491eced3f0e5391c), [`8569d56`](https://github.com/reown-com/appkit/commit/8569d56a3c6ab41833c7ef6a21712afee4bbcec0), [`39616f5`](https://github.com/reown-com/appkit/commit/39616f5efb6f5af17ef716aca2383597cd98fdde), [`0735f15`](https://github.com/reown-com/appkit/commit/0735f15c65b5de397dd856004f197f2ec07538f9), [`e946c97`](https://github.com/reown-com/appkit/commit/e946c977fcc6e1282f05d35955004fc391f3f354), [`aa24c91`](https://github.com/reown-com/appkit/commit/aa24c918f7c3f285b20d44c81a5d224743bcb4ed), [`d3ecccb`](https://github.com/reown-com/appkit/commit/d3ecccbbde0d40a27f2b261a3d99b15ab83149da), [`af58b49`](https://github.com/reown-com/appkit/commit/af58b49dda0ebdbdc76a5859692e5df46f6ca86a), [`60c1715`](https://github.com/reown-com/appkit/commit/60c17150bb29765bfc88e0f522484e59c3bdd1fe), [`7459461`](https://github.com/reown-com/appkit/commit/7459461eed6786a17c251c40aab153572ecda45f)]:
  - @reown/appkit-adapter-ethers@1.6.3
  - @reown/appkit@1.6.3
