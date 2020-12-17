# Web3Modal-Angular

Angular's version of https://github.com/Web3Modal/web3modal. Built on top of [web3modal-ts](https://gitlab.com/minds/web3modal-ts/).

## Motivation

Web3Modal is a very useful and easy to use library, that allows developers to add support for multiple providers in their apps with a simple customizable configuration. 

This project aims to provide the same ease of use as the original Web3Modal, in Angular, by leveraging the connectors/providers layer that the original Web3Modal implemented and was abstracted into [web3modal-ts](https://gitlab.com/minds/web3modal-ts/).

## Usage

1. Install Web3Modal-Angular NPM package

```bash
npm install --save @mindsorg/web3modal-angular
```

Or

```bash
yarn add @mindsorg/web3modal-angular
```

2. Import `Web3ModalModule` which contains and exports the `Web3ModalComponent`.

3. Instantiate the `Web3ModalService` with the `useFactory` pattern:

```ts
@NgModule({
  imports: [Web3ModalModule],
  providers: [
    {
      provide: Web3ModalService,
      useFactory: () => {
        return new Web3ModalService({
          network: "mainnet", // optional
          cacheProvider: true, // optional
          providerOptions // required
        });
      },
    },
  ]
})
```

For more information about the `Web3ModalService` constructor argument, see: [Web3Modal]((https://github.com/Web3Modal/web3modal#usage)) or [Web3Modal-TS](https://gitlab.com/minds/web3modal-ts/)

The `Web3WalletConnector` constructors takes an optional configuration argument that matches the [original web3modal's configuration object](https://github.com/Web3Modal/web3modal#usage)

See [Web3Modal's provider options](https://github.com/Web3Modal/web3modal#provider-options)

4. Declare `m-web3-modal` tag:

```html
<m-web3-modal
  title="Modal Title"
  description="Modal description"
  descriptionGray="Modal subtitle"
  dismissText="Text that will dismiss modal on click"
></m-web3-modal>
```

5. Call `open` on `Web3ModalService`

```ts
  const provider = await this.web3modalService.open();

```

This method returns a promise that resolves on connection and rejects on modal dismissal or connection errors.

The provider object resolved by the promise can be seamlessly consumed by a web3 library, like `Web3JS` or `EthersJS`.

```ts
import { Web3Provider } from '@ethersproject/providers';

const provider = await this.web3modalService.open();
const web3provider = new Web3Provider(provider)
```

## Provider Options

Web3Modal-TS supports the original Web3modal's Metamask WalletConnect, Fortmatic, Torus, Authereum, UniLogin, BurnerConnect, Portis, Squarelink, Arkane, Mew Connect protocol, D'CENT Wallet and Bitski. See [Web3Modal's provider options](https://github.com/Web3Modal/web3modal#provider-options)

Additionally, it supports:

### WalletLink

1. Install Provider Package

```bash
npm install --save walletlink

# OR

yarn add walletlink
```

2. Set Provider Options

```typescript
import WalletLink from "walletlink";

const providerOptions = {
  walletlink: {
    package: WalletLink,
    options: {
      infuraUrl: 'https://mainnet.infura.io/v3/PROJECT_ID',
      appName: "My Awesome DApp",
      appLogoUrl: "https://example.com/logo.png",
      darkMode: false
    },
  },
};
```

## License

MIT