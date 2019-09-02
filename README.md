# Web3connect

A single Web3 / Ethereum provider solution for all Wallets

## Introduction

Web3Connect is an easy-to-use library to help developers add support for multiple providers in their apps with a simple customizable configuration.

By default Web3Connect Library supports injected providers like (**Metamask**, **Dapper**, **Gnosis Safe**, Web3 Browsers, etc) and **WalletConnect**, You can also easily configure the library to support **Fortmatic**, **Squarelink**, and **Portis**.

## Preview

You can test the library on: https://web3connect.com/

![preview](./images/preview.gif)

## Usage

1. Install Web3Connect NPM package

```bash
npm install --save web3connect

# OR

yarn add web3connect
```

2. Install Provider packages

```bash
npm install --save @walletconnect/web3-provider @portis/web3 fortmatic squarelink

# OR

yarn add @walletconnect/web3-provider @portis/web3 fortmatic squarelink
```

3. Then you can integrate it three different ways:

- [React Button](#React-Button)
- [Core Module](#Core-Module)
- [Individual Connectors](#Individual-Connectors)

### React Button

Add Web3Connect Button to your React App as follows

```js
import Web3Connect from "web3connect";

<Web3Connect.Button
  network="mainnet" // optional
  providerOptions={{
    walletconnect: {
      infuraId: "INFURA_ID" // required
    },
    portis: {
      id: "PORTIS_ID" // required
    },
    squarelink: {
      id: "SQUARELINK_ID" // required
    },
    fortmatic: {
      key: "FORTMATIC_KEY" // required
    }
  }}
  onConnect={(provider: any) => {
    const web3 = new Web3(provider); // add provider to web3
  }}
  onClose={() => {
    console.log("Web3Connect Modal Closed"); // modal has closed
  }}
/>;
```

### Core Module

Add Web3Connect Core to your Dapp as follows

```js
import Web3Connect from "web3connect";

const web3Connect = new Web3Connect.Core({
  network: "mainnet", // optional
  providerOptions: {
    walletconnect: {
      infuraId: "INFURA_ID" // required
    },
    portis: {
      id: "PORTIS_ID" // required
    },
    squarelink: {
      id: "SQUARELINK_ID" // required
    },
    fortmatic: {
      key: "FORTMATIC_KEY" // required
    }
  }
});

// subscribe to connect
web3Connect.on("connect", (provider: any) => {
  const web3 = new Web3(provider); // add provider to web3
});

// subscribe to close
web3Connect.on("close", () => {
  console.log("Web3Connect Modal Closed"); // modal has closed
});

web3Connect.toggleModal(); // open modal on button click
```

### Individual Connectors

Add individual connectors for each provider to your own UI (no modal provided)

```js
import Web3Connect from "web3connect";

// For inject providers in dapp browsers
const provider = await Web3Connect.ConnectToInjected();

// For WalletConnect
const provider = await Web3Connect.ConnectToWalletConnect({
  infuraId: "INFURA_ID", // required
  bridge: "https://bridge.walletconnect.org" // optional
});

// For Squarelink
const provider = await Web3Connect.ConnectToSquarelink({
  id: "SQUARELINK_ID", // required
  network: "mainnet" // optional
});

// For Portis
const provider = await Web3Connect.ConnectToPortis({
  id: "PORTIS_ID", // required
  network: "mainnet" // optional
});

// For Fortmatic
const provider = await Web3Connect.ConnectToFortmatic({
  key: "FORTMATIC_KEY", // required
  network: "mainnet" // optional
});
```

## Utils

```typescript
function checkInjectedProviders(): IInjectedProvidersMap;
function getInjectedProviderName(): string | null;
function getProviderInfoByName(name: string | null): IProviderInfo;
function getProviderInfo(provider: any): IProviderInfo;
function isMobile(): boolean;
function formatProviderDescription(providerInfo: IProviderInfo);
```

## Types

```typescript
interface IProviderInfo {
  name: string;
  type: string;
  logo: string;
  check: string;
  styled: {
    [prop: string]: any;
  };
}

interface IProviderOptions {
  [providerName: string]: any;
}

interface IEventCallback {
  event: string;
  callback: (result: any) => void;
}

interface IInjectedProvidersMap {
  injectedAvailable: boolean;
  [isProviderName: string]: boolean;
}
```

## Options

- providerOptions (optional): An object mapping arbitrary string that adds the required configuration to multiple web3 providers.

  - WalletConnect:

    - infuraId: the infura app ID registered (required)
    - bridge: bridge url (optional)

  - Squarelink:

    - id: the client ID registered (required)
    - network: choose initial network name (optional)
    - config: additional configuration, like `scope` to use supplemental methods (optional)

  - Portis:

    - id: the app id registered (required)
    - network: choose initial network name (optional)
    - config: additional configuration, like support of Gas Station Network (optional)

  - Fortmatic:

    - key: the secret key (required)
    - network: choose initial network name (optional)

You can disable the injected provider by adding the following keys:

- disableInjectedProvider: true (optional)

## Collaboration

### Code contributions are welcome ❤️❤️❤️!

If you wish to support a new provider submit a issue to the repo or fork this repo and create a pull request.

You can join to our discord to further discuss https://discordapp.com/invite/YGnSX9y
