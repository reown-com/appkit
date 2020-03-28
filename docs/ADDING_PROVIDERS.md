# Adding a new provider

Do you want to add your provider to Web3Modal? All logic for supported providers lives inside the `src/providers` directory. To add a new follow the next steps:

Let's call this example provider Firebox

## 1) Create a new connector

Create a new connector file inside `src/providers/connectors` directory. The file should be named after your provider name's in lowercase (eg. firebox.ts)

This file should export as a default a callback function which must have two parameters: your provider package and a options object.

```typescript
// src/providers/connectors/firebox.ts

interface IFireboxOptions {
  apiKey: string;
}

const ConnectToFirebox = async (
  FireboxProvider: any,
  opts: IFireboxOptions
) => {
  const provider = new FireboxProvider(opts.apiKey);

  await provider.enable();

  return provider;
};
```

Make sure you return your provider only after enabling it. Any provider-specific UI/UX should also be handled inside enable.

## 2) Add your connector to the index.ts

On the same directory (`src/providers/connectors`) there is an `index.ts` file where we expose all connectors, you should add yours as follows:

```typescript
// src/providers/connectors/index.ts

import firebox from "./firebox";

export default {
  // other connectors
  firebox
};
```

## 3) Add your logo to the assets directory

The logo can be either svg, png or jpg but you should try to keep it small around 200x200px size. The directory is located at `src/providers/logos` and you should also name your file as provider's name (eg. firebox.png)

## 4) Add your Provider info to providers index

On the providers directory (`src/providers/`) there is an index file where you can list your provider information. Your provider information should a constant variable with capitalized name and it should match the `IProviderInfo` interface as follows:

```typescript
// src/providers/index.ts

import FireboxLogo from "./logos/firebox.png";

export const FIREBOX_PROVIDER: IProviderInfo = {
  id: "firebox",
  name: "Firebox",
  logo: FireboxLogo,
  type: "web",
  check: "isFirebox",
  styled: {
    noShadow: false
  },
  package: {
    required: ["apiKey"]
  }
};
```

More detail on how the IProviderInfo interface works is still undocumentated but the most important parts to pay attention are the required array for your provider options, the id should be lowercase and the logo should be imported as demonstrated.

## 5) List your provider in the mapping

On the bottom of the same file as the step before (`src/providers/index.ts`), you should also add your provider to the mapping using references to your provider info and add your connector as well as follows:

```typescript
// src/providers/index.ts

export const providerMapping: IProviderMappingEntry[] = [
  // other providers
  {
    id: FIREBOX_PROVIDER.id,
    name: FIREBOX_PROVIDER.name,
    connector: connectors.firebox,
    package: FIREBOX_PROVIDER.package
  }
];
```

## 6) Update the Web3Modal README file

Finally you should update the main README file so other developers can use your provider with Web3Modal easily. Inside the section of **Provider Options** you should add an example of how to configure Web3Modal to display your provider using the provider-specific options.

```typescript
### Firebox

1. Install Provider Package

npm install --save firebox-web3-provider

# OR

yarn add firebox-web3-provider


2. Set Provider Options

import FireboxProvider from "firebox-web3-provider";

const providerOptions = {
  firebox: {
    package: FireboxProvider, // required
    options: {
      apiKey: "FIREBOX_API_KEY" // required
    }
  }
};
```
