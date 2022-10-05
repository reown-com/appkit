# @web3modal/react

## Getting Started

Make sure to read our [main readme](./../../readme.md) first to find out details about projectId, chain specific packages and modal customisation options. Please ensure you are updated to the latest React / Next.js or similar version, as web3modal libraries target `es2020`.

### 1. Install dependencies

```
npm install @web3modal/react @web3modal/ethereum ethers
```

### 2. Configure web3modal at the root of your app

See [@web3modal/ethereum](../../chains/ethereum/readme.md) readme for all available `ethereum` options. NextJS example is also available in [examples/react](../../examples/react) folder.

```tsx
import type { ConfigOptions } from '@web3modal/react'
import { Web3Modal } from '@web3modal/react'

const config: ConfigOptions = {
  projectId: '<YOUR_PROJECT_ID>',
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'web3Modal'
  }
}

export default function App() {
  return (
    <>
      <YourAppContent />
      <Web3Modal config={config} />
    </>
  )

```

### 3. Add <ConnectButton> component or useConnectModal hook to open the modal

```tsx
import { ConnectButton, useConnectModal } from '@web3modal/react'

export default function YourAppContent() {
  const { isOpen, open, close } = use

  return (
    <>
      <ConnectButton />
      {/* or */}
      <button onClick={open}>Open Modal</button>
    </>
  )
}
```

## Modal Hooks

Hooks to manage web3modal

### useConnectModal

Hook to check state of the modal, open or close it

```ts
import { useConnectModal } from '@web3modal/ethereum'

// Usage
const { isOpen, open, close } = useConnectModal()

// Returns
interface Return {
  isOpen: boolean
  open: () => void
  close: () => void
}
```

## Data Hooks

Hooks that return blockchain, account or network data. By default these automatically retrieve data for currently active network (chainId) one time when they are mounted. You can tweak this behaviour with following shared options (where available)

```ts
interface Options {
  // Specify concrete chainId for which to retrieve data, defaults to currently selected chain id
  chainId?: number

  // Specify whether hook should retrieve data when mounted or not, defaults to true
  enabled?: boolean

  // Specify whether hook should continuously watch for new data (every block). This uses websocket if available or falls back to pooling, default false
  watch?: boolean
}
```

### useAccount

Hook to get account data - [Example](../../examples/react/src/sections/UseAccount.tsx)

```ts
import { useAccount } from '@web3modal/ethereum'

// Usage
const { address, isConnected } = useAccount()

// Returns
interface Return {
  address?: string
  connector?: Connector
  isConnecting?: boolean
  isReconnecting?: boolean
  isConnected?: boolean
  isDisconnected?: boolean
  status?: 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
}
```

### useBalance

Hook for fetching balance information for Ethereum or ERC-20 tokens.

```ts
import { useBalance } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useBalance({ formatUnits: 'ether' })

// Returns
interface Return {
  data?: {
    decimals: number
    formatted: string
    symbol: string
    value: BigNumber
  }
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  watch?: boolean
  enabled?: boolean
  addressOrName: string
  chainId?: number
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
  token?: string
}
```

### useBlockNumber

Hook for fetching the current block number.

```ts
import { useBlockNumber } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useBlockNumber({ watch: true })

// Returns
interface Return {
  data?: number
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  watch?: boolean
  enabled?: boolean
  chainId?: number
}
```

### useContract

Hook for declaratively creating an ethers [Contract](https://docs.ethers.io/v5/api/contract/contract/) instance.

```ts
import { useContract } from '@web3modal/ethereum'
import ensRegistryABI from './yourAbi/ensRegistryABI.json'

// Usage
const contract = useContract({
  addressOrName: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  contractInterface: ensRegistryABI
})

// Returns
ethers.Contract | undefined

// Options
interface Options {
  addressOrName: string
  contractInterface: ContractInterface
  signerOrProvider?: Provider | Signer
}
```
