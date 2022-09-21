# @web3modal/react

## Getting Started

Make sure to read our [main readme](./../../readme.md) first to find out details about projectId, chain specific packages and modal customisation options.

### 1. Install dependencies

```
npm install @web3modal/react @web3modal/ethereum ethers
```

### 2. Configure wagmi and web3modal clients at the root of your app

See [@web3modal/ethereum](../../chains/ethereum/readme.md) readme for all available `ethereum` options. NextJS example is also awailable in [examples/react](../../examples/react) folder.

```tsx
import type { ConfigOptions } from '@web3modal/react'
import { Web3ModalProvider } from '@web3modal/react'

const config: ConfigOptions = {
  projectId: '<YOUR_PROJECT_ID>',
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'web3Modal'
  }
}

export default function App() {
  return <Web3ModalProvider config={config}>{/* Rest of your app */}</Web3ModalProvider>
}
```

## Hooks

Please refer to [hooks folder](./src/hooks/) for more detailed info abut usage and argument / return types.

### useConnectModal

Hook to open, close and check state of the connect modal

```tsx
import { useConnectModal } from '@web3modal/ethereum'

const { isOpen, open, close } = useConnectModal()
```

### useAccount

Hook to get account data

```tsx
import { useAccount } from '@web3modal/ethereum'

const { chainSupported, address, chainId, connector } = useAccount()
```

### useBalance

Hook to get account data

```tsx
import { useBalance } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  chainId: string // CAIP format i.e. Ethereum would be eip155:1
  formatUnits: FetchBalanceArgs['formatUnits']
}

const { refetch, isLoading, error, balance } = useBalance(options)
```

### useNetwork

Hook to get network data

```tsx
import { useNetwork } from '@web3modal/ethereum'

const { chain, chains } = useNetwork()
```

### useSigner

Hook to get ethers signer

```tsx
import { useSigner } from '@web3modal/ethereum'

const { refetch, isLoading, error, signer } = useSigner()
```

### useSignMessage

Hook to crate and handle sign message request

```tsx
import { useSignMessage } from '@web3modal/ethereum'

const { isLoading, error, signature, sign } = useSignMessage()
```

### useSignTypedData

Hook to crate and handle sign typed data request

```tsx
import { useSignTypedData } from '@web3modal/ethereum'

const { isLoading, error, signature, sign } = useSignTypedData()
```

### useSwitchNetork (⚠️ experimental)

Hook to switch between supported networks

```tsx
import { useSwitchNetork } from '@web3modal/ethereum'

const { isLoading, error, chainId, switchChain } = useSwitchNetork()
```

### useContract

Hook to get contract details

```tsx
import { useContract } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  contractInterface: GetContractArgs['contractInterface']
  signerOrProvider: GetContractArgs['signerOrProvider']
}

const { refetch, error, contract } = useContract(options)
```

### useContractEvent

Hook to subscribe / receive contract events

```tsx
import { useContractEvent } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  contractInterface: GetContractArgs['contractInterface']
  signerOrProvider: GetContractArgs['signerOrProvider']
  event: string
  handler: (args: unknown[]) => void
  once: boolean
}

const { refetch, error, contract } = useContractEvent(options)
```

### useContractRead

Hook to read from contract

```tsx
import { useContractRead } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  functionName: string
  contractInterface: ReadContractConfig['contractInterface']
  args: unknown
  chainId: string
  overrides: ReadContractConfig['overrides']
}

const { refetch, isLoading, error, read } = useContractRead(options)
```

### useContractWrite

Hook to write to contract

```tsx
import { useContractWrite } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  functionName: string
  contractInterface: ReadContractConfig['contractInterface']
  args: unknown
  chainId: string
  overrides: ReadContractConfig['overrides']
  request: Exclude<WriteContractArgs['request'], undefined>
}

const { data, refetch, isLoading, error } = useContractWrite(options)
```

### usePrepareContractWrite

Hook to prepare for contract write

```tsx
import { usePrepareContractWrite } from '@web3modal/ethereum'

interface Options {
  addressOrName: string
  functionName: string
  contractInterface: ReadContractConfig['contractInterface']
  args: unknown
  chainId: string
  overrides: ReadContractConfig['overrides']
  request: Exclude<WriteContractArgs['request'], undefined>
}

const { write, refetch, isLoading, error } = usePrepareContractWrite(options)
```

### useToken

Hook to get token data

```tsx
import { useToken } from '@web3modal/ethereum'

interface Options {
  address: string
  chainId: string
  formatUnits: FetchTokenArgs['formatUnits']
}

const { refetch, isLoading, error, token } = useToken(options)
```

### useWatchReadContract

Hook to read and watch contract

```tsx
import { useWatchReadContract } from '@web3modal/ethereum'

interface Options {
  callback: WatchReadContractResult
  listenToBlock: boolean
}

useWatchReadContract(options)
```

### useFetchEnsAddress

Hook to fetch public address from ens adress

```tsx
import { useFetchEnsAddress } from '@web3modal/ethereum'

interface Options {
  chainId: string
  name: string
}

const { refetch, isLoading, error, address } = useFetchEnsAddress(options)
```

### useFetchEnsAvatar

Hook to fetch ens avatar

```tsx
import { useFetchEnsAvatar } from '@web3modal/ethereum'

interface Options {
  chainId: string
  addressOrName: string
}

const { refetch, isLoading, error, avatar } = useFetchEnsAvatar(options)
```

### useFetchEnsName

Hook to fetch ens name for public address

```tsx
import { useFetchEnsName } from '@web3modal/ethereum'

interface Options {
  chainId: string
  address: string
}

const { refetch, isLoading, error, name } = useFetchEnsName(options)
```

### useFetchEnsResolver

Hook to get contract address for ens name resolver

```tsx
import { useFetchEnsResolver } from '@web3modal/ethereum'

interface Options {
  chainId: string
  name: string
}

const { refetch, isLoading, error, address } = useFetchEnsResolver(options)
```

### useFetchTransaction

Hook to fetch a transaction

```tsx
import { useFetchTransaction } from '@web3modal/ethereum'

interface Options {
  chainId: string
  hash: FetchTransactionArgs['hash']
}

const { refetch, isLoading, error, transaction } = useFetchTransaction(options)
```

### usePrepareSendTransaction

Hook to prepare send transaction request

```tsx
import { usePrepareSendTransaction } from '@web3modal/ethereum'

interface Options {
  chainId: string
  request: PrepareSendTransactionArgs['request']
  signerOrProvider?: PrepareSendTransactionArgs['signerOrProvider']
}

const { refetch, isLoading, error, transaction } = usePrepareSendTransaction(options)
```

### useSendTransaction

Hook to send transaction

```tsx
import { useSendTransaction } from '@web3modal/ethereum'

interface Options {
  chainId: string
  request: SendTransactionArgs['request'] & {
    to: `0x${string}`
    gasLimit?: Exclude<SendTransactionArgs['request']['gasLimit'], undefined>
  }
}

const { refetch, isLoading, error, transaction } = useSendTransaction(options)
```

### useWaitForTransaction

Hook to send transaction

```tsx
import { useWaitForTransaction } from '@web3modal/ethereum'

interface Options {
  chainId: string
  confirmation?: number
  hash?: string
  timeout?: number
  wait?: WaitForTransactionArgs['wait']
}

const { refetch, isLoading, error, transaction } = useWaitForTransaction(options)
```
