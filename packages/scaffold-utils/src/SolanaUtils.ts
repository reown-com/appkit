import type { W3mFrameProvider } from '@web3modal/wallet'
import type { CaipNetwork } from '@web3modal/scaffold'
import { PublicKey } from '@solana/web3.js'

import UniversalProvider from '@walletconnect/universal-provider'
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { ConstantsUtil } from './ConstantsUtil.js'
import { PresetsUtil } from './PresetsUtil.js'

// -- Types ---------------------------------------------- //
export interface ISolConfig {
  providers: ProviderType
  defaultChain?: number
  SSR?: boolean
}

export type Address = `0x${string}`

export type ProviderType = {
  injected?: Provider
  coinbase?: Provider
  email?: boolean
  EIP6963?: boolean
  metadata: Metadata
}

export interface RequestArguments {
  readonly method: string
  readonly params?: readonly unknown[] | object
}

export interface Provider {
  request: <T>(args: RequestArguments) => Promise<T>
  on: <T>(event: string, listener: (data: T) => void) => void
  removeListener: <T>(event: string, listener: (data: T) => void) => void
  emit: (event: string) => void
}

export type Metadata = {
  name: string
  description: string
  url: string
  icons: string[]
}

export type CombinedProvider = W3mFrameProvider & Provider

export type Chain = {
  rpcUrl: string
  explorerUrl: string
  currency: string
  name: string
  chainId: string
}

export enum Tag {
  Uninitialized = 0,
  ActiveOffer = 1,
  CancelledOffer = 2,
  AcceptedOffer = 3,
  FavouriteDomain = 4,
  FixedPriceOffer = 5,
  AcceptedFixedPriceOffer = 6,
  CancelledFixedPriceOffer = 7
}

export interface Status {
  Ok: null
}

export interface Meta {
  err: null
  fee: number
  innerInstructions: TransactionInstruction[]
  logMessages: string[]
  postBalances: number[]
  postTokenBalances: number[]
  preBalances: number[]
  preTokenBalances: number[]
  rewards: null
  status: Status
}

interface TransactionInstruction {
  accounts: number[]
  data: string
  programIdIndex: number
}

export interface TransactionElement {
  meta: Meta
  transaction: TransactionTransaction
}

export interface TransactionTransaction {
  message: Message
  signatures: string[]
}

export interface Transaction {
  message: Message
  signatures: string[]
}

export interface TransactionResult {
  meta: Meta
  slot: number
  transaction: Transaction
}

export interface Message {
  accountKeys: string[]
  header: Header
  instructions: Instruction[]
  recentBlockhash: string
}

export interface Header {
  numReadonlySignedAccounts: number
  numReadonlyUnsignedAccounts: number
  numRequiredSignatures: number
}

export interface Instruction {
  accounts: number[]
  data: string
  programIdIndex: number
}

export interface BlockResult {
  blockHeight: number
  blockTime: null
  blockhash: string
  parentSlot: number
  previousBlockhash: string
  transactions: TransactionElement[]
}

export interface AccountInfo {
  data: string[]
  executable: boolean
  lamports: number
  owner: string
  rentEpoch: number
}

export type FilterObject =
  | {
    memcmp: {
      offset: number
      bytes: string
      encoding?: string
    }
  }
  | { dataSize: number }

export interface TransactionInstructionRq {
  programId: string
  data: string
  keys: { isSigner: boolean; isWritable: boolean; pubkey: string }[]
}

export interface RequestMethods {
  solana_signMessage: {
    params: {
      message: string
      pubkey: string
    }
    returns: {
      signature: string
    }
  }
  solana_signTransaction: {
    params: {
      feePayer: string
      instructions: TransactionInstructionRq[]
      recentBlockhash: string
      signatures?: { pubkey: string; signature: string }[]
    }
    returns: {
      signature: string
    }
  }
  signMessage: {
    params: {
      message: Uint8Array
      format: string
    }
    returns: {
      signature: string
    } | null
  }

  signTransaction: {
    params: {
      // Serialized transaction
      message: string
    }
    returns: {
      serialize: () => string
    } | null
  }
}

export interface TransactionArgs {
  transfer: {
    params: {
      to: string
      amountInLamports: number
      feePayer: 'from' | 'to'
    }
  }
  program: {
    params: {
      programId: string
      isWritableSender: boolean
      data: Record<string, unknown>
    }
  }
}

export type TransactionType = keyof TransactionArgs

export interface ClusterRequestMethods {
  sendTransaction: {
    // Signed, serialized transaction
    params: string[]
    returns: string
  }

  getFeeForMessage: {
    params: [string]
    returns: number
  }

  getBlock: {
    params: [number]
    returns: BlockResult | null
  }

  getBalance: {
    params: [string, { commitment: 'processed' | 'finalized' }]
    returns: {
      value: number
    }
  }

  getProgramAccounts: {
    params: [
      string,
      {
        filters?: FilterObject[]
        encoding: 'base58' | 'base64' | 'jsonParsed'
        withContext?: boolean
      }
    ]
    returns: {
      value: { account: AccountInfo }[]
    }
  }

  getAccountInfo: {
    params: [string, { encoding: 'base58' | 'base64' | 'jsonParsed' }] | [string]
    returns?: {
      value: AccountInfo | null
    }
  }

  getTransaction: {
    params: [
      string,
      { encoding: 'base58' | 'base64' | 'jsonParsed'; commitment: 'confirmed' | 'finalized' }
    ]
    returns: TransactionResult | null
  }

  getLatestBlockhash: {
    params: [{ commitment?: string }]
    returns: {
      value: {
        blockhash: string
      }
    }
  }
}

export interface ClusterSubscribeRequestMethods {
  signatureSubscribe: {
    params: string[]
    returns: Transaction
  }
  signatureUnsubscribe: {
    params: number[]
    returns: unknown
  }
}

// -- Store--------------------------------------------- //
export interface SolStoreUtilState {
  projectId: string
  provider?: Provider | CombinedProvider | UniversalProvider
  providerType?: 'walletConnect' | 'injected' | 'coinbaseWallet' | 'eip6963' | 'w3mEmail'
  address?: Address | ''
  chainId?: string
  currentChain?: Chain
  requestId?: number
  error?: unknown
  isConnected: boolean
}

type StateKey = keyof SolStoreUtilState

// -- State --------------------------------------------- //
const state = proxy<SolStoreUtilState>({
  projectId: '',
  provider: undefined,
  providerType: undefined,
  address: undefined,
  currentChain: undefined,
  chainId: undefined,
  isConnected: false
})

export const SolStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: SolStoreUtilState[K]) => void) {
    return subKey(state, key, callback)
  },

  subscribe(callback: (newState: SolStoreUtilState) => void) {
    return sub(state, () => callback(state))
  },

  setProvider(provider: SolStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider)
    }
  },

  setProviderType(providerType: SolStoreUtilState['providerType']) {
    state.providerType = providerType
  },

  getProjectId() {
    return state.projectId
  },

  setProjectId(projectId: string) {
    state.projectId = projectId
  },

  setAddress(address: SolStoreUtilState['address'] | '') {
    state.address = address
  },

  setChainId(chainId: SolStoreUtilState['chainId']) {
    state.chainId = chainId
  },

  setIsConnected(isConnected: SolStoreUtilState['isConnected']) {
    state.isConnected = isConnected
  },

  setError(error: SolStoreUtilState['error']) {
    state.error = error
  },

  setCurrentChain(chain: Chain) {
    state.currentChain = chain
  },

  getCluster() {
    const chain = state.currentChain as Chain
    return {
      name: chain.name,
      id: chain.chainId,
      endpoint: chain.rpcUrl
    }
  },

  getNewRequestId() {
    const curId = state.requestId ?? 0
    state.requestId = curId + 1

    return state.requestId
  },

  reset() {
    state.provider = undefined
    state.address = undefined
    state.chainId = undefined
    state.providerType = undefined
    state.isConnected = false
    state.error = undefined
  }
}

// -- Constants --------------------------------------------- //
export const SolConstantsUtil = {
  HASH_PREFIX: 'SPL Name Service',
  NAME_OFFERS_ID: new PublicKey('85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29'),
  /**
   * The `.sol` TLD
   */
  ROOT_DOMAIN_ACCOUNT: new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx'),
  /**
   * The Solana Name Service program ID
   */
  NAME_PROGRAM_ID: new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX'),
  /**
   * The reverse look up class
   */
  REVERSE_LOOKUP_CLASS: new PublicKey('33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z'),
  TOKEN_PROGRAM_ID: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  /**
   * Mainnet program ID
   */
  NAME_TOKENIZER_ID: new PublicKey('nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk'),
  MINT_PREFIX: Buffer.from('tokenized_name'),
  WALLET_ID: '@w3m/solana_wallet',
  CHAIN_ID: '@w3m/solana_chain',
  ERROR_CODE_UNRECOGNIZED_CHAIN_ID: 4902,
  ERROR_CODE_DEFAULT: 5000
}

// -- Helpers --------------------------------------------- //
export const SolHelpersUtil = {
  getChain(chains: Chain[], chainId: string) {
    const chain = chains.find(chain => chain.chainId === chainId)
    if (chain) {
      return chain;
    }
    return chains[0]
  },
  getCaipDefaultChain(chain?: Chain) {
    if (!chain) {
      return undefined
    }

    return {
      id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
      name: chain.name,
      imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
    } as CaipNetwork
  },
  hexStringToNumber(value: string) {
    const string = value.startsWith('0x') ? value.slice(2) : value
    const number = parseInt(string, 16)

    return number
  },
  numberToHexString(value: number | string) {
    return `0x${value.toString(16)}`
  },
  async getAddress(provider: Provider) {
    const [address] = await provider.request<string[]>({ method: 'getAccountInfo' })

    return address
  },
  async addSolanaChain(provider: Provider, chain: Chain) {
    await provider.request({
      method: 'wallet_addSolanaChain',
      params: [
        {
          chainId: SolHelpersUtil.numberToHexString(chain.chainId),
          rpcUrls: [chain.rpcUrl],
          chainName: chain.name,
          nativeCurrency: {
            name: chain.currency,
            decimals: 18,
            symbol: chain.currency
          },
          blockExplorerUrls: [chain.explorerUrl],
          iconUrls: [PresetsUtil.EIP155NetworkImageIds[chain.chainId]]
        }
      ]
    })
  }
}
