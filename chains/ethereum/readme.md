# @web3modal/ethereum

## Getting Started

Our ethereum/evm package is based on [@wagmi/core](https://wagmi.sh/). However in order to support multiple frameworks and chains in the future, we had to make some changes to how we handle internal store, chain id's etc. Due to this _make sure that you use imports from @web3modal packages_.
Web3Modal uses [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md) chain format instead of common integer one. This means that when working with our libraries you need to provide chainId's like this `eip155:1` (ethereum mainnet) instead of `1`. All `@web3modal/ethereum` compatable chains will start with `eip155:`. You can see list of chain id's at https://chainlist.org

We highly recomend reading through [wagmi](https://wagmi.sh/) if you want to understand how this package works under the hood.

## Configuration

| Option      | Description                                                                        | Required | Default          |
| ----------- | ---------------------------------------------------------------------------------- | -------- | ---------------- |
| appName     | String containing your app name                                                    | YES      |                  |
| autoConnect | Boolean indicating whether user should be re-connected when they re-visit your app | NO       | `true`           |
| chains      | Array of [chains](./src/utils/wagmiTools.ts) supported from your app               | NO       | `mainnet`        |
| chains      | Array of [providers](./src/utils/wagmiTools.ts) supported from your app            | NO       | `publicProvider` |

## Imports

```ts
import { chains, providers } from '@web3modal/ethereum'
```
