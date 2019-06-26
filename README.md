# Web3connect

A single Web3 / Ethereum provider solution for all Wallets

## Introduction

web3connect a react commponet that helps developers to add support to multiple providers in their apps with simple configuration.

By defaut Web3Connect Library supports injected providers like (**Metamask**, **Dapper**, Web3 Browsers, etc) and **WalletConnect**, You can also easily configure the library to support **Fortmatic** and **Portis**.

## Preview

You can test the library on: https://web3connect.netlify.com/

![preview](./images/preview.gif)

## Usage

Install Web3Connect NPM package

```bash
npm install --save web3connect

# OR

yarn add web3connect
```

Then you can integrate it three different ways:

- [React Button](#React-Button)
- [Core Module](#Core-Module)
- [Individual Connectors](#Individual-Connectors)

### React Button

Add Web3Connect Button to your React App as follows

```js
import Web3Connect from "web3connect";

<Web3Connect.Button
  providerOptions={{
    portis: {
      id: "PORTIS_ID", // required
      network: "mainnet" // optional
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
  portis: {
    id: "PORTIS_ID", // required
    network: "mainnet" // optional
  },
  fortmatic: {
    key: "FORTMATIC_KEY" // required
  }
});

// subscibe to connect
web3Connect.on("connect", (provider: any) => {
  const web3 = new Web3(provider); // add provider to web3
});

// subscibe to close
web3Connect.on("close", () => {
  console.log("Web3Connect Modal Closed"); // modal has closed
});

web3Connect.toggleModal(); // open modal on button click
```

### Individual Connectors

Add individual connectors for each provider to your own UI (no modal provided)

```js
import {
  ConnectToInjected,
  ConnectToWalletConnect,
  ConnectToPortis,
  ConnectToFortmatic
} from "web3connect";

// For inject providers in dapp browsers
const provider = await ConnectToInjected();

// For WalletConnect
const provider = await ConnectToWalletConnect({
  bridge: "https://bridge.walletconnect.org" // optional
});

// For Portis
const provider = await ConnectToPortis({
  id: "PORTIS_ID", // required
  network: "mainnet" // optional
});

// For Fortmatic
const provider = await ConnectToPortis({
  key: "FORTMATIC_KEY" // required
});
```

## Options

- providerOptions (optional): An object mapping arbitrary string that adds the required configuration to multiple web3 providers.

  - WalletConnect:

    - bridge: bridge url (optional)

  - Portis:

    - id: the app id registered (required)
    - network: choose initial network name (optional)

  - Fortmatic:
    - key: the secret key (required)

## Collaboration

### Code contributions are welcome ❤️❤️❤️!

If you wish to support a new provider submit a issue to the repo or fork this repo and create a pull request.

You can join to our discord to further discuss https://discordapp.com/invite/YGnSX9y
