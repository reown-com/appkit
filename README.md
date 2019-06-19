# Web3connect

[![Discord](https://hook.io/geo1088/discord-badge)](https://discordapp.com/invite/YGnSX9y)

## Introduction

web3connect a react commponet that helps developers to add support to multiple providers in their apps with simple configuration.

By defaut Web3Connect Library supports injected providers like (**Metamask**, **Dapper**, Web3 Browsers, etc) and **WalletConnect**, You can also easily configure the library to support **Fortmatic** and **Portis**.

## Preview

You can test the library on: https://web3connect.netlify.com/

![preview](./images/preview.gif)

## Usage

Install Web3Connect:

```bash
npm i web3connect --save
```

Add the Library to your project:

```js
import Web3Connect from "web3connect";

<Web3Connect
  providerOptions={{
    portis: {
      id: "PORTIS_KEY",
      network: "mainnet"
    },
    fortmatic: {
      key: "FORTMATIC_KEY"
    }
  }}
  onConnect={(provider: any) => {
    this.onConnect(provider);
  }}
  onClose={() => {
    console.log("[Web3Connect] onClose"); // tslint:disable-line
  }}
/>;
```

The Web3Connect takes 3 props:

- providerOptions: any (optional): An object mapping arbitrary string that adds the required configuration to multiple web3 providers.

  - Portis: requires the id of the dapp and the network.

  - Fortmatic: requires the api key.

- onConnect: function (required): Triggers when a web3 provider has been connected.

- onClose: function (required): Triggers when the lightbox closes.

## Collaboration

#### Code contributions are welcome ❤️❤️❤️!

If you wish to support a new provider submit a issue to the repo or fork this repo and create a pull request.

You can join to our discord to further discuss https://discordapp.com/invite/YGnSX9y
