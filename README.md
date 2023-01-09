# Web3Modal

A single Web3 / Ethereum provider solution for all Wallets

## Introduction

Web3Modal is an easy-to-use library to help developers add support for multiple providers in their apps with a simple customizable configuration.

By default Web3Modal Library supports injected providers like (**Metamask**,**Rainbow**,**Brave Wallet**, **Dapper**, **Frame**, **Gnosis Safe**, **Tally**, Web3 Browsers, etc) and **WalletConnect**. You can also easily configure the library to support **Coinbase Wallet**, **Torus**, **Portis**, **Fortmatic** and many more.

## Preview

You can test the library on: https://web3modal.com/

![preview](./images/preview.png)

## Projects using `web3modal`

_Open a PR to add your project to the list!_

- [DAO Stack](https://alchemy.daostack.io/)
- [Gnosis Safe](https://gnosis-safe.io/)
- [3Box Hub](https://3box.io/hub/)
- [KnownOrigin](https://knownorigin.io/)
- [Clovers Network](https://clovers.network/)
- [Affogato](https://affogato.co/)
- [Linkdrop](https://dashboard.linkdrop.io/)
- [Dapparatus](https://github.com/austintgriffith/dapparatus/)
- [Totle Swap](https://swap.totle.com/)
- [Win Or Lose](https://www.winorlose.live/)
- [HODLbag NFT](https://hodlbag.org/)
- [Forever in Ether](https://ineth.net/)
- [Civilization](https://app.civfund.org/)
- [OlympusDAO](https://app.olympusdao.finance/)
- [The Unit](https://app.theunit.one/)
- [Sign-in with Ethereum](https://login.xyz/)
- [AngularWeb3Boilerplate](https://github.com/AntonioCardenas/AngularWeb3Boilerplate)
- [BalconyDAO](https://balconydao.com/)
- [LearnWeb3 DAO](https://learnweb3.io/)
- [The Miners Comic](https://theminersnft.com/)
- [Sealcred](https://sealcred.xyz/)
- etc

## Related Efforts

- [web3-react](https://github.com/NoahZinsmeister/web3-react/)

## Usage

1. Install Web3Modal NPM package

```bash
npm install --save web3modal

# OR

yarn add web3modal
```

2. Install Provider packages

```js
/* See Provider Options Section */
```

3. Then you can add Web3Modal to your Dapp as follows

```js
import Web3 from "web3";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const provider = await web3Modal.connect();

const web3 = new Web3(provider);
```

## Using with [ethers.js](https://github.com/ethers-io/ethers.js/)

```js
import { ethers } from "ethers";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const instance = await web3Modal.connect();

const provider = new ethers.providers.Web3Provider(instance);
const signer = provider.getSigner();
```
Here's a live example on [Codesandbox.io](https://codesandbox.io/s/j43b10)

## Using with [Vite](https://github.com/vitejs/vite)

```js
//vite.config.js
import nodePolyfills from "rollup-plugin-polyfill-node";
const production = process.env.NODE_ENV === "production";

export default {
  plugins: [
    // ↓ Needed for development mode
    !production &&
      nodePolyfills({
        include: ["node_modules/**/*.js", new RegExp("node_modules/.vite/.*js")]
      })
  ],

  build: {
    rollupOptions: {
      plugins: [
        // ↓ Needed for build
        nodePolyfills()
      ]
    },
    // ↓ Needed for build if using WalletConnect and other providers
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
};
```

## Using in vanilla JavaScript

You can use the modal from the old fashioned web page JavaScript as well.

[First get a Web3modal bundled JavaScript from Releases](https://github.com/Web3Modal/web3modal/releases).

After including the bundle in your HTML, you can use it on your web page:

```js
//  You have to refer to default since it was bundled for ESModules
// but after that the documentation will be the same

const Web3Modal = window.Web3Modal.default;
const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const provider = await web3Modal.connect();
```

[See the full vanilla JavaScript example application](https://github.com/Web3Modal/web3modal-vanilla-js-example).

## Provider Events

You should subscribe to provider events compatible with [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) standard.

```typescript
// Subscribe to accounts change
provider.on("accountsChanged", (accounts: string[]) => {
  console.log(accounts);
});

// Subscribe to chainId change
provider.on("chainChanged", (chainId: number) => {
  console.log(chainId);
});

// Subscribe to provider connection
provider.on("connect", (info: { chainId: number }) => {
  console.log(info);
});

// Subscribe to provider disconnection
provider.on("disconnect", (error: { code: number; message: string }) => {
  console.log(error);
});
```

## Provider Options

These are all the providers available with Web3Modal and how to configure their provider options:

- [WalletConnect](./docs/providers/walletconnect.md)
- [Coinbase Wallet](./docs/providers/coinbasewallet.md)
- [Ledger](./docs/providers/ledger.md)
- [Fortmatic](./docs/providers/fortmatic.md)
- [Torus](./docs/providers/torus.md)
- [Portis](./docs/providers/portis.md)
- [Authereum](./docs/providers/authereum.md)
- [Frame](./docs/providers/frame.md)
- [Bitski](./docs/providers/bitski.md)
- [Venly](./docs/providers/venly.md)
- [DCent](./docs/providers/dcent.md)
- [BurnerConnect](./docs/providers/burnerconnect.md)
- [MEWConnect](./docs/providers/mewconnect.md)
- [Binance Chain Wallet](./docs/providers/binancechainwallet.md)
  [Opera Wallet](./docs/providers/opera.md)
- [Sequence](./docs/providers/sequence.md)
- [CLV Wallet](./docs/providers/clvwallet.md)
- [Web3Auth](./docs/providers/web3auth.md)
- [Bitkeep Wallet](./docs/providers/bitkeep.md)
- [99Starz Wallet](./docs/providers/starzwallet.md)
- [Phantom Wallet](./docs/providers/phantom.md)

## API

```typescript
class Web3Modal {
  cachedProvider: string;
  connect(): Promise<any>;
  connectTo(id: string): Promise<any>;
  toggleModal(): Promise<void>;
  on(event: string, callback: SimpleFunction): SimpleFunction;
  off(event: string, callback?: SimpleFunction): void;
  clearCachedProvider(): void;
  setCachedProvider(): void;
  updateTheme(theme: string | ThemeColors): Promise<void>;
}
```

## Utils

```typescript
function getInjectedProvider(): IProviderInfo | null;
function getInjectedProviderName(): string | null;

function getProviderInfo(provider: any): IProviderInfo;
function getProviderInfoByName(name: string | null): IProviderInfo;
function getProviderInfoById(id: string | null): IProviderInfo;
function getProviderInfoByCheck(check: string | null): IProviderInfo;
```

## Types

```typescript
interface IProviderInfo {
  id: string;
  type: string;
  check: string;
  name: string;
  logo: string;
  description?: string;
  package?: {
    required?: string[];
  };
}

type ThemeColors = {
  background: string;
  main: string;
  secondary: string;
  border: string;
  hover: string;
};

type SimpleFunction = (input?: any) => void;
```

## Custom Themes

The theme enabled by default is `light` but dark theme is also available by setting the option `theme` to `dark`, as follows:

```typescript
const web3Modal = new Web3Modal({
  ...otherOptions,
  theme: "dark"
});
```

Completely custom themes are also available by passing an object instead with the following parameters with valid css colors values:

```typescript
const web3Modal = new Web3Modal({
  ...otherOptions,
  theme: {
    background: "rgb(39, 49, 56)",
    main: "rgb(199, 199, 199)",
    secondary: "rgb(136, 136, 136)",
    border: "rgba(195, 195, 195, 0.14)",
    hover: "rgb(16, 26, 32)"
  }
});
```

Addtionally you can also update the modal theme after instantiated by calling the following method:

```typescript
await web3Modal.updateTheme("dark");

// OR

await web3Modal.updateTheme({
  background: "rgb(39, 49, 56)",
  main: "rgb(199, 199, 199)",
  secondary: "rgb(136, 136, 136)",
  border: "rgba(195, 195, 195, 0.14)",
  hover: "rgb(16, 26, 32)"
});
```

## Custom Display

It's possible to customize the display of each provider to change the name, description and logo. These options are available as part of the provider options as following

```typescript
const providerOptions = {
  // Example with injected providers
  injected: {
    display: {
      logo: "data:image/gif;base64,INSERT_BASE64_STRING",
      name: "Injected",
      description: "Connect with the provider in your Browser"
    },
    package: null
  },
  // Example with WalletConnect provider
  walletconnect: {
    display: {
      logo: "data:image/gif;base64,INSERT_BASE64_STRING",
      name: "Mobile",
      description: "Scan qrcode with your mobile wallet"
    },
    package: WalletConnectProvider,
    options: {
      infuraId: "INFURA_ID" // required
    }
  }
};
```

You can change only one of the display options, you are not required to fill all 3 options, example:

```typescript
const providerOptions = {
  walletconnect: {
    display: {
      name: "Mobile"
    },
    package: WalletConnectProvider,
    options: {
      infuraId: "INFURA_ID" // required
    }
  }
};
```

## Custom Provider

If you would like to include a provider that isn't supported yet on Web3Modal, we would recommend you submit a PR following the simple five steps in our ["Adding Providers" instructions](docs/ADDING_PROVIDERS.md)

If still need to add a custom provider to your Web3Modal integration, you can add it to the provider options with a key prefixed with `custom-` and you will need to include the display options and connector handler as follows

```typescript
import ExampleProvider from "example-provider";

const providerOptions = {
  "custom-example": {
    display: {
      logo: "data:image/gif;base64,INSERT_BASE64_STRING",
      name: "Example Provider",
      description: "Connect to your example provider account"
    },
    package: ExampleProvider,
    options: {
      apiKey: "EXAMPLE_PROVIDER_API_KEY"
    },
    connector: async (ProviderPackage, options) => {
      const provider = new ProviderPackage(options);

      await provider.enable();

      return provider;
    }
  }
};
```

## Connect to specific provider

In case you want to connect a specific provider, you can use the method `connectTo` and use the specific id. Example:

```js
import Web3 from "web3";
import Web3Modal from "web3modal";

const providerOptions = {
  /* See Provider Options Section */
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

const provider = await web3Modal.connectTo("walletconnect");

const web = new Web3(provider);
```

## Optional Flags

### Disable Injected Provider

By default is set to `false` and Web3Modal always displays InjectedProvider as an option to the user if available. However you can disable it as an optional flag if you desire:

```javascript
const web3Modal = new Web3Modal({ disableInjectedProvider: true });
```

### Cache Provider

By default is set to `false` and Web3Modal will always require the user to choose a provider option before triggering the onConnect event. However you can enable caching the last chosen provider. Example:

```javascript
const web3Modal = new Web3Modal({ cacheProvider: true });
```

If you wish to reset the cached provider you can call the following method:

```typescript
web3Modal.clearCachedProvider();
```

If you wish to connect to the cachedProvider you can simply do the following:

```typescript
if (web3Modal.cachedProvider) {
  await web3Modal.connect();
}
```

## Adding a new provider

Do you want to add your provider to Web3Modal? All logic for supported providers lives inside the `src/providers` directory. To add a new follow the following steps [here](docs/ADDING_PROVIDERS.md)

## Migrating from Web3Connect

If you were using Web3Connect before you can check the migration instructions for how to use Web3Modal and handle breaking changes [here](docs/MIGRATION_INSTRUCTIONS.md)

## Contributions

**Code contributions are welcome ❤️❤️❤️!**

If you wish to support a new provider submit a issue to the repo or fork this repo and create a pull request.

You can join to our discord to further discuss https://discordapp.com/invite/YGnSX9y

## License

MIT
