# Running in vanilla html / javascript

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

## Modal Controllers

Controllers to get, watch or perform actions on data

### ConfigCtrl

Controllers to set up web3modal configuration.

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

Controllers to set up chain specific clients.

```ts
import { ClientCtrl } from '@web3modal/core'

// functions
ClientCtrl.setEthereumClient(options)

const unsubscribe = ClientCtrl.subscribe(state => {})
unsubscribe()

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

Controllers to open, close and subscribe to modal state.

```ts
import { ModalCtrl } from '@web3modal/core'

// functions
ModalCtrl.open()

ModalCtrl.close()

const unsubscribe = ModalCtrl.subscribe(state => {})
unsubscribe()

// types
interface State {
  open: boolean
}
```

---

### AccountCtrl

Controllers to get, watch or disconnect an account

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

Controllers to fetch and watch account balance

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
