# @web3modal/react

## Getting Started

Make sure to read our [main readme](./../../readme.md) first to find out details about projectId, chain specific packages and modal customisation options. Please ensure you are updated to the latest React / Next.js or similar version, as web3modal libraries target `es2020`. Web3Modal hooks are based on [wagmi](https://wagmi.sh/), so it is good idea to read through their documentation as well. Do note, you have to import and use these hooks from `@web3modal` packages.

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
}
```

### 3. Add <ConnectButton> component or useConnectModal hook to open the modal

```tsx
import { ConnectButton, useConnectModal } from '@web3modal/react'

export default function YourAppContent() {
  const { isOpen, open, close } = useConnectModal()

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

Hooks to manage web3modal.

### useConnectModal

Hook to check state of the modal, open or close it.

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

Hooks that return blockchain, account or network data. By default these automatically retrieve data for currently active network (chainId) one time when they are mounted. You can tweak this behaviour with following shared options (where available).

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

---

### useAccount ([Example](../../examples/react/src/sections/UseAccount.tsx))

Hook to get account data.

```ts
import { useAccount } from '@web3modal/ethereum'

// Usage
const { address, isConnected } = useAccount()

// Returns
interface Return {
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

### useBalance ([Example](../../examples/react/src/sections/UseBalance.tsx))

Hook for fetching balance information for Ethereum or ERC-20 tokens.

```ts
import { useBalance } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useBalance({ addressOrName: 'vitalik.eth' })

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
  addressOrName: string
  watch?: boolean
  enabled?: boolean
  chainId?: number
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
  token?: string
}
```

---

### useBlockNumber ([Example](../../examples/react/src/sections/UseBlockNumber.tsx))

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

---

### useContract ([Example](../../examples/react/src/sections/UseContract.tsx))

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

---

### useContractEvent ([Example](../../examples/react/src/sections/UseContractEvent.tsx))

Hook for subscribing to ethers Contract [events](https://docs.ethers.io/v5/api/contract/contract/#Contract--events).

```ts
import { useContractEvent } from '@web3modal/ethereum'
import ensRegistryABI from './yourAbi/ensRegistryABI.json'

// Usage
useContractEvent({
  addressOrName: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  contractInterface: ensRegistryABI,
  eventName: 'NewOwner',
  listener: event => console.log(event)
})

// Options
interface Options {
  addressOrName: string
  contractInterface: ContractInterface
  eventName: string
  listener: (event?: any) => void
  chainId? number
  once?: boolean
}
```

---

### useContractRead ([Example](../../examples/react/src/sections/UseContractRead.tsx))

Hook for calling an ethers Contract [read-only](https://docs.ethers.io/v5/api/contract/contract/#Contract--readonly) method.

```ts
import { useContractRead } from '@web3modal/ethereum'
import wagmigotchiABI from './yourAbi/wagmigotchiABI.json'

// Usage
const { data, error, isLoading, refetch } = useContractRead({
  addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
  contractInterface: wagmigotchiABI,
  functionName: 'getHunger'
})

// Returns
interface Return {
  data?: Result
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  addressOrName: string
  contractInterface: ContractInterface
  functionName: string
  args?: any
  overrides?: CallOverrides
  chainId?: number
  enabled?: boolean
  watch?: boolean
}
```

---

### useEnsAddress ([Example](../../examples/react/src/sections/UseEnsAddress.tsx))

Hook for fetching address for ENS name.

```ts
import { useEnsAddress } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useEnsAddress({
  name: 'vitalik.eth'
})

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  name: string
  chainId?: number
  enabled?: boolean
}
```

---

### useEnsAvatar ([Example](../../examples/react/src/sections/UseEnsAvatar.tsx))

Hook for fetching avatar for ENS name.

```ts
import { useEnsAvatar } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useEnsAvatar({
  addressOrName: 'vitalik.eth'
})

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  addressOrName: string
  chainId?: number
  enabled?: boolean
}
```

---

### useEnsName ([Example](../../examples/react/src/sections/UseEnsName.tsx))

Hook for fetching ENS name for address.

```ts
import { useEnsName } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useEnsName({
  address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
})

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  address: string
  chainId?: number
  enabled?: boolean
}
```

---

### useEnsResolver ([Example](../../examples/react/src/sections/UseEnsResolver.tsx))

Hook for fetching the resolver for ENS name.

```ts
import { useEnsResolver } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useEnsResolver({
  name: 'vitalik.eth'
})

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  name: string
  chainId?: number
  enabled?: boolean
}
```

---

### useFeeData ([Example](../../examples/react/src/sections/UseFeeData.tsx))

Hook for fetching network fee information.

```ts
import { useFeeData } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useFeeData({ formatUnits: 'gwei' })

// Returns
interface Return {
  data?: {
    gasPrice: BigNumber
    maxFeePerGas: BigNumber
    maxPriorityFeePerGas: BigNumber
    formatted: {
      gasPrice: string
      maxFeePerGas: string
      maxPriorityFeePerGas: string
    }
  }
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
  chainId?: number
  watch?: boolean
  enabled?: boolean
}
```

---

### useNetwork ([Example](../../examples/react/src/sections/UseNetwork.tsx))

Hook for accessing network data, such as current connected chain and connector chains.

```ts
import { useNetwork } from '@web3modal/ethereum'

// Usage
const { chain, chains } = useNetwork()

// Returns
interface Return {
  chain?: Chain & { unsupported?: boolean }
  chains?: Chain[]
}
```

---

### useProvider ([Example](../../examples/react/src/sections/UseProvider.tsx))

Hook for accessing Client's ethers [Provider](https://docs.ethers.io/v5/api/providers/).

```ts
import { useProvider } from '@web3modal/ethereum'

// Usage
const provider = useProvider()

// Returns
ethers.Provider?
```

---

### useWebsocketProvider ([Example](../../examples/react/src/sections/UseProvider.tsx))

Hook for accessing the Client's ethers [WebSocket Provider](https://docs.ethers.io/v5/api/providers/other/#WebSocketProvider).

```ts
import { useWebsocketProvider } from '@web3modal/ethereum'

// Usage
const websocketProvider = useWebsocketProvider()

// Returns
ethers.WebSocketProvider?
```

---

### useSigner ([Example](../../examples/react/src/sections/UseSigner.tsx))

Hook for accessing ethers [Signer](https://docs.ethers.io/v5/api/signer/) object for connected account.

```ts
import { useSigner } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading } = useSigner()

// Returns
interface Return {
  data?: ethers.providers.JsonRpcSigner
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}
```

---

### useToken ([Example](../../examples/react/src/sections/UseToken.tsx))

Hook for fetching ERC-20 token information.

```ts
import { useToken } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useToken({
  address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'
})

// Returns
interface Return {
  data?: {
    address: string
    decimals: number
    name: string
    symbol: string
    totalSupply: {
      formatted: string
      value: BigNumber
    }
  }
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  address: string
  chainId?: number
  enabled?: boolean
  formatUnits?: number | 'wei' | 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'ether'
}
```

---

### useTransaction ([Example](../../examples/react/src/sections/UseTransaction.tsx))

Hook for fetching transaction by hash.

```ts
import { useTransaction } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useTransaction({
  hash: '0xe75fb554e433e03763a1560646ee22dcb74e5274b34c5ad644e7c0f619a7e1d0'
})

// Returns
interface Return {
  data?: TransactionResponse
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  hash: string
  chainId?: number
  enabled?: boolean
}
```

---

### useWaitForTransaction ([Example](../../examples/react/src/sections/UseWaitForTransaction.tsx))

Hook for declaratively waiting until transaction is processed. Pairs well with `useContractWrite` and `useSendTransaction`.

```ts
import { useWaitForTransaction } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, refetch } = useWaitForTransaction({
  hash: '0xe75fb554e433e03763a1560646ee22dcb74e5274b34c5ad644e7c0f619a7e1d0'
})

// Returns
interface Return {
  data?: TransactionResponse
  error?: Error
  isLoading: boolean
  refetch: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  confirmations?: number
  hash?: string
  timeout?: number
  chainId?: number
  enabled?: boolean
}
```

## Action Hooks

Hooks that expose action / write opperations.

---

### useContractWrite ([Example](../../examples/react/src/sections/UseContractWrite.tsx))

Hook for calling an ethers Contract [write](https://docs.ethers.io/v5/api/contract/contract/#Contract--write) method. Perpares transaction under the hood i.e. estimates gas price.

```ts
import { useContractWrite } from '@web3modal/ethereum'
import wagmigotchiABI from './yourAbi/wagmigotchiABI.json'

// Usage
const { data, error, isLoading, write } = useContractWrite({
  addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
  contractInterface: wagmigotchiABI,
  functionName: 'feed'
})
write()

// Returns
interface Return {
  data?: TransactionResponse
  error?: Error
  isLoading: boolean
  write: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  functionName: string
  chainId?: number | undefined
  args?: any
  overrides?: CallOverrides
  signer?: Signer
}
```

---

### useDisconnect

Hook for disconnecting the connected account.

```ts
import { useDisconnect } from '@web3modal/ethereum'

// Usage
const disconnect = useDisconnect()
disconnect()

// Returns
() => void
```

---

### useSendTransaction ([Example](../../examples/react/src/sections/UseSendTransaction.tsx))

Hook for sending a transaction. Perpares transaction under the hood i.e. estimates gas price.

```ts
import { useSendTransaction } from '@web3modal/ethereum'
import { BigNumber } from 'ethers'

// Usage
const { data, error, isLoading, sendTransaction } = useSendTransaction({
  request: {
    to: 'vitalik.eth',
    value: BigNumber.from('10000000000000000')
  }
})
sendTransaction()

// Returns
interface Return {
  data?: TransactionResponse
  error?: Error
  isLoading: boolean
  sendTransaction: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  request: TransactionRequest & {
    to: string
  }
  chainId?: number
  signer?: Signer
}
```

---

### useSignMessage ([Example](../../examples/react/src/sections/UseSignMessage.tsx))

Hook for signing messages with connected account.

```ts
import { useSignMessage } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, signMessage } = useSendTransaction({
  message: 'WalletConnect web3modal message'
})
signMessage()

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  signMessage: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  message: string | Bytes
}
```

---

### useSignTypedData ([Example](../../examples/react/src/sections/UseSignTypedData.tsx))

Hook for signing messages with connected account.

```ts
import { useSignTypedData } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, signTypedData } = useSignTypedData({
  domain,
  types,
  value
})
signTypedData()

// Returns
interface Return {
  data?: string
  error?: Error
  isLoading: boolean
  signTypedData: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
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
```

---

### useSwitchNetwork ([Example](../../examples/react/src/sections/UseSwitchNetwork.tsx))

Hook for switching networks with a connector.

```ts
import { useSwitchNetwork } from '@web3modal/ethereum'

// Usage
const { data, error, isLoading, switchNetwork } = useSwitchNetwork({
  chainId: 1
})
switchNetwork()

// Returns
interface Return {
  data?: Chain
  error?: Error
  isLoading: boolean
  switchNetwork: (options?: Options) => Promise<Return['data']>
}

// Options
interface Options {
  chainId?: number
}
```
