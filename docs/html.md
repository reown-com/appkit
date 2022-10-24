# Web3Modal js/html usage

## Getting Started

Make sure to read our [main readme](./../readme.md) first to find out details about projectId, chain specific packages and modal customisation options. Please ensure your build tools are set up to handle `es2020` target.
Vanilla html / javascript usage is based on various controllers like `AccountCtrl`, `TransactionCtrl` and others demonstrated below.

### 1. Install core dependencies

```
npm install @web3modal/core @web3modal/ui
```

### 2. Install chain specific depedencies

```
npm install @web3modal/ethereum ethers
```

### 3. Configure web3modal

See [@web3modal/ethereum](../../chains/ethereum/readme.md) readme for all available `ethereum` options. Vanilla example is also available in [examples/html](../examples/html) folder.

```tsx
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import { chains, providers } from '@web3modal/ethereum'
import '@web3modal/ui'

// Configure web3modal
ConfigCtrl.setConfig({
  projectId: '<YOUR_PROJECT_ID>',
  theme: 'dark',
  accentColor: 'default'
})

// Configure ethereum client
ClientCtrl.setEthereumClient({
  appName: 'web3Modal',
  autoConnect: true,
  chains: [chains.mainnet],
  providers: [providers.walletConnectProvider({ projectId: '<YOUR_PROJECT_ID>' })]
})
```

### 3. Add <w3m-connect-button> (optional) and <w3m-modal> webcomponents to your html

```html
<body>
  <w3m-connect-button></w3m-connect-button>
  <w3m-modal></w3m-modal>
</body>
```

## Controllers

Controllers to manage web3modal and read / write data from the blockchain

### ConfigCtrl

Controller to set up web3modal configuration.

```ts
import { ConfigCtrl } from '@web3modal/core'

// functions
ConfigCtrl.setConfig(options)

// types
interface Options {
  projectId: string
  theme: 'dark' | 'light'
  accentColor: 'blackWhite' | 'blue' | 'default' | 'green' | 'magenta' | 'orange' | 'teal'
}
```

---

### ClientCtrl

Controller to set up chain specific clients.

```ts
import { ClientCtrl } from '@web3modal/core'

// functions
ClientCtrl.setEthereumClient(options)

const unwatch = ClientCtrl.subscribe(state => {})
unwatch()

// types
interface Options {
  appName: string
  autoConnect?: boolean
  chains?: Chain[]
  providers?: ChainProviderFn[]
}

interface State {
  initialized: boolean
}
```

---

### ModalCtrl

Controller to open, close and subscribe to modal state.

```ts
import { ModalCtrl } from '@web3modal/core'

// functions
ModalCtrl.open()

ModalCtrl.close()

const unwatch = ModalCtrl.subscribe(state => {})
unwatch()

// types
interface State {
  open: boolean
}
```

---

### AccountCtrl

Controller to get account data.

```ts
import { AccountCtrl } from '@web3modal/core'

// functions
const account = AccountCtrl.get()

AccountCtrl.watch(account => {})

AccountCtrl.disconnect()

// types
interface Account {
  address: string | ''
  connector?: Connector
  isConnecting?: boolean
  isReconnecting?: boolean
  isConnected?: boolean
  isDisconnected?: boolean
  status?: 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
}
```

---

### BalanceCtrl

Controller for fetching balance information for Ethereum or ERC-20 tokens.

```ts
import { BalanceCtrl } from '@web3modal/core'

// functions
const balance = await BalanceCtrl.fetch(options)

BalanceCtrl.watch(options, balance => {})

// types
interface Balance {
  decimals: number
  formatted: string
  symbol: string
  value: BigNumber
}

interface Options {
  addressOrName: string
  watch?: boolean
  enabled?: boolean
  chainId?: number
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
  token?: string
}
```

---

### BlockCtrl

Controller for fetching the current block number.

```ts
import { BlockCtrl } from '@web3modal/core'

// functions
const block = await BlockCtrl.fetch(options)

BlockCtrl.watch(block => {}, options)

// types
type Block = number

interface Options {
  chainId?: number
}
```

---

### ContractCtrl

Controller for creating and working with ethers [Contract](https://docs.ethers.io/v5/api/contract/contract/) instance.

```ts
import { ContractCtrl } from '@web3modal/core'

// functions
const contract = ContractCtrl.get(config)

const read = await ContractCtrl.read(readConfig)

const write = await ContractCtrl.write(writeConfig)

const unwatch = ContractCtrl.watchRead(read => {}, readConfig)
unwatch()

const unwatch = ContractCtrl.watchEvent((...event) => {}, eventConfig)
unwatch()

// types
interface Config {
  address: string
  abi: Narrow<TAbi>
  signerOrProvider?: Provider | Signer | undefined
}

type Contract = ethers.Contract

interface ReadConfig {
  address: string
  abi: ContractInterface
  functionName: string
  args?: any[]
  overrides?: CallOverrides
  chainId?: number
}

type Read = Result

interface WriteConfig {
  functionName: string
  chainId?: number | undefined
  args?: any[]
  overrides?: CallOverrides
  signer?: Signer
}

type Write = TransactionResponse

interface EventConfig {
  address: string
  abi: ContractInterface
  eventName: string
  chainId?: number
  once?: boolean
}
```

---

### EnsCtrl

Controller for fetching ENS data.

```ts
import { EnsCtrl } from '@web3modal/core'

// functions
const ensAddress = await ContractCtrl.fetchEnsAddress(addressArgs)

const ensAvatar = await ContractCtrl.fetchEnsAvatar(avatarArgs)

const ensName = await ContractCtrl.fetchEnsName(nameArgs)

const ensResolver = await ContractCtrl.fetchEnsResolver(resolverArgs)

// types
interface AddressArgs {
  name: string
  chainId?: number
}

type EnsAddress = string

interface AvatarArgs {
  addressOrName: string
  chainId?: number
}

type EnsAvatar = string

interface NameArgs {
  address: string
  chainId?: number
}

type EnsName = string

interface ResolverArgs {
  address: string
  abi: ContractInterface
  eventName: string
  chainId?: number
  once?: boolean
}

type EnsResolver = string
```

---

### FeeCtrl

Controller for fetching network fee information.

```ts
import { FeeCtrl } from '@web3modal/core'

// functions
const fees = await FeeCtrl.fetch(options)

const unwatch = FeeCtrl.watch(fees => {}, options)
unwatch()

// types
interface Options {
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
  chainId?: number
}

interface Fees {
  gasPrice: BigNumber
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
  formatted: {
    gasPrice: string
    maxFeePerGas: string
    maxPriorityFeePerGas: string
  }
}
```

---

### NetworkCtrl

Controller for accessing network data, such as current connected chain and connector chains. Also switching to a different network.

```ts
import { NetworkCtrl } from '@web3modal/core'

// functions
const network = NetworkCtrl.get()

const unwatch = NetworkCtrl.watch(network => {})
unwatch()

NetworkCtrl.switchNetwork(options)

// types
interface Network {
  chain?: Chain & { unsupported?: boolean }
  chains?: Chain[]
}

interface Options {
  chainId: number
}
```

---

### ProviderCtrl

Controller for accessing Client's ethers [Provider](https://docs.ethers.io/v5/api/providers/).

```ts
import { ProviderCtrl } from '@web3modal/core'

// functions
const provider = ProviderCtrl.get(options)

const unwatch = ProviderCtrl.watch(provider => {}, options)
unwatch()

// types
interface Options {
  chainId?: number
}

type Provider = ethers.Provider
```

---

### WebsocketProviderCtrl

Controller for accessing the Client's ethers [WebSocket Provider](https://docs.ethers.io/v5/api/providers/other/#WebSocketProvider).

```ts
import { WebsocketProviderCtrl } from '@web3modal/core'

// functions
const provider = WebsocketProviderCtrl.get(options)

const unwatch = WebsocketProviderCtrl.watch(provider => {}, options)
unwatch()

// types
interface Options {
  chainId?: number
}

type Provider = ethers.WebsocketProvider
```

---

### SignerCtrl

Controller for accessing ethers [Signer](https://docs.ethers.io/v5/api/signer/) object for connected account.

```ts
import { SignerCtrl } from '@web3modal/core'

// functions
const signer = await SignerCtrl.fetch(options)

const signMessage = await SignerCtrl.signMessage(signMessageArguments)

const signTypedData = await SignerCtrl.signTypedData(signTypedData)

const unwatch = SignerCtrl.watch(signer => {}, options)
unwatch()

// types
interface Options {
  chainId?: number
}

interface SignMessageArguments {
  message: string | Bytes
}

type SignMessage = string

interface SignTypedDataArguments {
  domain: {
    name?: string
    version?: string
    chainId?: string | number | bigint
    verifyingContract?: string
    salt?: BytesLike
  }
  types: Record<
    string,
    Array<{
      name: string
      type: string
    }>
  >
  value: Record<string, any>
}

type SignTypedData = string
```

---

### TokenCtrl

Controller for fetching ERC-20 token information.

```ts
import { TokenCtrl } from '@web3modal/core'

// functions
const token = await TokenCtrl.fetch(options)

// types
interface Options {
  address: string
  chainId?: number
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
}

interface Token {
  address: string
  decimals: number
  name: string
  symbol: string
  totalSupply: {
    formatted: string
    value: BigNumber
  }
}
```

---

### TransactionCtrl

Controller for Hook for fetching / sending transactions.

```ts
import { TransactionCtrl } from '@web3modal/core'

// functions
const transaction = await TransactionCtrl.fetch(fetchOptions)

const transaction = await TransactionCtrl.send(sendOptions)

const transaction = await TransactionCtrl.wait(waitOptions)

// types
interface FetchOptions {
  hash: string
  chainId?: number
}

interface SendOptions {
  request: TransactionRequest & {
    to: string
  }
  chainId?: number
  signer?: Signer
}

interface WaitOptions {
  confirmations?: number
  hash?: string
  timeout?: number
  chainId?: number
}

type Transaction = TransactionResponse
```

---
