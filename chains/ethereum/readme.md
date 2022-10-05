# @web3modal/ethereum

## Getting Started

If you have ever used or read documentation of [@wagmi/core](https://wagmi.sh/), you should feel very comfortable with `@web3modal/ethereum` package.
This package should be used in tandem with `@web3modal/react`, other framework packages or in vanilla js projects.

## Configuration

| Option      | Description                                                                        | Required | Default          |
| ----------- | ---------------------------------------------------------------------------------- | -------- | ---------------- |
| appName     | String containing your app name                                                    | YES      |                  |
| autoConnect | Boolean indicating whether user should be re-connected when they re-visit your app | NO       | `true`           |
| chains      | Array of [chains](./src/utils/wagmiTools.ts) supported from your app               | NO       | `mainnet`        |
| providers   | Array of [providers](./src/utils/wagmiTools.ts) supported from your app            | NO       | `publicProvider` |

## Imports

```ts
import { chains, providers } from '@web3modal/ethereum'
```
