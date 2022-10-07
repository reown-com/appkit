> Looking for v1.x readme? It is available on [V1 Branch](https://github.com/WalletConnect/web3modal/tree/V1)

# Web3Modal

Your on-ramp to web3 multichain. Web3Modal is a versatile library that makes it super easy to connect users with your Dapp and start interacting with the blockchain.

⚠️ v2 is in early alpha and we are continuously adding more features, examples and documentation. As of now we support use cases with react and evm chains. Support for more frameworks and chains is on the way.

<p align="center">
  <img src="./.github/assets/header.png" alt="" border="0">
</p>

## Quick Start

Getting started with web3modal is as easy as installing few packages, one for your preferred front-end framework i.e. `@web3modal/react` and chain ecosystem you are working with i.e `@web3modal/ethereum`.

### 1. Obtain your WalletConnect projectId

Head over to [cloud.walletconnect.com](https://cloud.walletconnect.com/) to sign up and generate your `projectId`, which will be required to allow interactions with our explorer api, optional WalletConnect rpc provider and more v2 protocol features in the future.

### 2. Follow instructions and examples for your favourite framework

- [React Docs](./packages/react/) / [React Example](./examples/react/)
- Vue Docs / Vue Example (coming soon)
- Angular Docs / Angular Example (coming soon)
- Vanilla JS Docs / Vanila JS Example (coming soon)

### 3. Familiarise yourself with each chain package that you intend to use

- [@web3modal/ethereum](./chains/ethereum/) - EVM chains
- @web3modal/solana - (coming soon)

### 4. Customise your modal!

Web3Modal exposes some config options that allow you to personalise it and make it fit in better with your dapp's ui. As of now supported config options are specified below, but more are on the way!

<p align="center" style="margin-top: 20px">
  <img src="./.github/assets/custom.png" alt="" border="0">
</p>

| Option      | Values                                                                |
| ----------- | --------------------------------------------------------------------- |
| theme       | `dark`, `light`                                                       |
| accentColor | `blackWhite`, `blue`, `default`, `green`, `magenta`, `orange`, `teal` |

## Development

### Workspace setup

Install dependencies from the repository's root directory (this will also set up each workspace):

```bash
yarn
```

Common commands:

- `yarn dev` - Build and watch all packages for changes simultaneously.
- `yarn build` - Build all packages + examples.
- `yarn lint` - Run the linter.
- `yarn prettier` - Run prettier.

### React Example

#### Configuration

Create your own `.env.local` file and add your ProjectID from [cloud.walletconnect.com](https://cloud.walletconnect.com/):

```bash
# 1. change into example directory
cd ./examples/react
# 2. Copy the template env file
cp .env.local.example .env.local
# 3. Replace the NEXT_PUBLIC_PROJECT_ID placeholder inside `.env.local` with your own projectId
```

Run the app:

```bash
yarn dev
```

#### Reflecting local package changes

Via symlinking:

```bash
# 1. Set up the package for symlinking
cd packages/core
yarn link

# 2. Symlink the demo to our local copy of the package.
cd examples/react
yarn link "@web3modal/core"

# 3. Changes made to `packages/core` should now reflect in the app.
```
