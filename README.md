# Web3connect

A single Web3 / Ethereum provider solution for all Wallets

## Introduction

Web3Connect is an easy-to-use library to help developers add support for multiple providers in their apps with a simple customizable configuration.

By default Web3Connect Library supports injected providers like (**Metamask**, **Dapper**, **Gnosis Safe**, Web3 Browsers, etc) and **WalletConnect**, You can also easily configure the library to support **Fortmatic**, **Squarelink**, **Portis** and **Arkane**.

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
npm install --save @walletconnect/web3-provider @portis/web3 fortmatic squarelink @arkane-network/web3-arkane-provider

# OR

yarn add @walletconnect/web3-provider @portis/web3 fortmatic squarelink @arkane-network/web3-arkane-provider
```

3. Then you can integrate it three different ways:

- [React Button](#React-Button)
- [Core Module](#Core-Module)
- [Individual Connectors](#Individual-Connectors)

### React Button

Add Web3Connect Button to your React App as follows

```js
import Web3Connect from "web3connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Squarelink from "squarelink";
import Arkane from '@arkane-network/web3-arkane-provider';

<Web3Connect.Button
  network="mainnet" // optional
  providerOptions={{
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "INFURA_ID" // required
      }
    },
    portis: {
      package: Portis, // required
      options: {
        id: "PORTIS_ID" // required
      }
    },
    torus: {
      package: Torus, // required
      options: {
        enableLogging: false, // optional
        buttonPosition: "bottom-left", // optional
        buildEnv: "production", // optional
        showTorusButton: true // optional
      }
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "FORTMATIC_KEY" // required
      }
    },
    squarelink: {
      package: Squarelink, // required
      options: {
        id: "SQUARELINK_ID" // required
      }
    },
    arkane: {
      package: Arkane, // required
      options: {
        clientId: 'ARKANE_CLIENT_ID' // required, replace
      }
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
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Squarelink from "squarelink";
import Arkane from '@arkane-network/web3-arkane-provider';

const web3Connect = new Web3Connect.Core({
  network: "mainnet", // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "INFURA_ID" // required
      }
    },
    portis: {
      package: Portis, // required
      options: {
        id: "PORTIS_ID" // required
      }
    },
    torus: {
      package: Torus, // required
      options: {
        enableLogging: false, // optional
        buttonPosition: "bottom-left", // optional
        buildEnv: "production", // optional
        showTorusButton: true // optional
      }
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "FORTMATIC_KEY" // required
      }
    },
    squarelink: {
      package: Squarelink, // required
      options: {
        id: "SQUARELINK_ID" // required
      }
    },
    arkane: {
      package: Arkane, // required
      options: {
        clientId: 'ARKANE_CLIENT_ID' // required, replace
      }
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
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Squarelink from "squarelink";

// For inject providers in dapp browsers
const provider = await Web3Connect.ConnectToInjected();

// For WalletConnect
const provider = await Web3Connect.ConnectToWalletConnect(
  WalletConnectProvider,
  {
    infuraId: "INFURA_ID", // required
    bridge: "https://bridge.walletconnect.org" // optional
  }
);

// For Portis
const provider = await Web3Connect.ConnectToPortis(Portis, {
  id: "PORTIS_ID", // required
  network: "mainnet" // optional
});

// For Fortmatic
const provider = await Web3Connect.ConnectToFortmatic(Fortmatic, {
  key: "FORTMATIC_KEY", // required
  network: "mainnet" // optional
});

// For Arkane
const provider = await Web3Connect.ConnectToArkane(Arkane, {
  key: "ARKANE_CLIENT_ID", // required
  environment: "staging" // optional
});

// For Torus
const provider = await Web3Connect.ConnectToTorus();

// For Squarelink
const provider = await Web3Connect.ConnectToSquarelink(Squarelink, {
  id: "SQUARELINK_ID", // required
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
  [providerName: string]: {
    package: any;
    options: any;
  };
}

interface IInjectedProvidersMap {
  injectedAvailable: boolean;
  [isProviderName: string]: boolean;
}

interface IProviderCallback {
  name: string | null;
  onClick: () => Promise<void>;
}
```

## Options

- providerOptions (optional): An object mapping arbitrary string that adds the required configuration to multiple web3 providers.

  - walletconnect:

    - package: dependency injection to enable provider
    - options:
      - infuraId: the infura app ID registered (required)
      - bridge: bridge url (optional)

  - portis:

    - package: dependency injection to enable provider
    - options:
      - id: the app id registered (required)
      - network: choose initial network name (optional)
      - config: additional configuration, like support of Gas Station Network (optional)

  - fortmatic:

    - package: dependency injection to enable provider
    - options:
      - key: the secret key (required)
      - network: choose initial network name (optional)
  
  - arkane:
  
      - package: dependency injection to enable provider
      - options:
        - clientId: the client id used by the application (required)
        - nodeUrl: choose initial network name (optional)
        - environment: the environment to connect to (optional). Production by default, use 'staging' for testing

  - squarelink:

    - package: dependency injection to enable provider
    - options:
      - id: the client ID registered (required)
      - network: choose initial network name (optional)
      - config: additional configuration, like `scope` to use supplemental methods (optional)

You can disable the injected provider by adding the following flag:

- disableInjectedProvider: true (optional)

## Collaboration

### Code contributions are welcome ❤️❤️❤️!

If you wish to support a new provider submit a issue to the repo or fork this repo and create a pull request.

You can join to our discord to further discuss https://discordapp.com/invite/YGnSX9y
