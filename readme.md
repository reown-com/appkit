> Looking for v1.x readme? It is available on [V1 Branch](https://github.com/WalletConnect/web3modal/tree/V1)

### 📚 [Documentation website](https://web3modal.com/)

### 🖥️ [Interactive example](https://web3modal-dev.pages.dev/)

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

- [React Docs](./docs/react.md) / [React Example](./examples/react/)
- [Vanilla JS Docs](./docs/html.md) / [Vanila JS Example](./examples/html/)
- Vue Docs / Vue Example (coming soon)
- Angular Docs / Angular Example (coming soon)

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

## Contributing

If you want to contribute to the development of Web3Modal, please follow the instructions in [Development](docs/development.md).
