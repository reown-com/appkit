import type { ActorRefFrom, SnapshotFrom } from 'xstate'

import type { Balance, ChainNamespace } from '@reown/appkit-common'

export interface SendContext {
  // Form data
  selectedToken?: Balance
  sendAmount?: number
  receiverAddress?: string
  receiverProfileName?: string
  receiverProfileImageUrl?: string

  // Data state
  tokenBalances: Balance[]
  networkBalanceInUSD?: string

  // Chain context
  chainNamespace?: ChainNamespace

  // Loading and retry logic
  loading: boolean
  lastRetry?: number
  retryCount: number

  // Error handling
  error?: string
  validationErrors: {
    amount?: string
    address?: string
    token?: string
    general?: string
  }
}

export type SendEvent =
  // User events
  | { type: 'SELECT_TOKEN'; token: Balance }
  | { type: 'SET_AMOUNT'; amount: number }
  | { type: 'SET_ADDRESS'; address: string }
  | { type: 'CLEAR_ADDRESS' }
  | { type: 'FETCH_BALANCES' }
  | { type: 'REFRESH_BALANCES' }
  | { type: 'SEND_TRANSACTION' }
  | { type: 'RETRY_SEND' }
  | { type: 'RESET_FORM' }
  | { type: 'RESET_VALIDATION_ERRORS' }
  | { type: 'CANCEL_SEND' }
  | { type: 'GO_TO_TOKEN_SELECT' }
  | { type: 'VALIDATION_ERROR'; field: string; message: string }
  | { type: 'SET_LOADING'; loading?: boolean }
  // XState service completion events
  | { type: 'xstate.done.actor.ensResolver'; output: ENSResolutionOutput }
  | { type: 'xstate.done.actor.balanceFetcher'; output: Balance[] }
  | { type: 'xstate.done.actor.networkPriceFetcher'; output?: string }
  | { type: 'xstate.done.actor.evmTransactionSender'; output: TransactionOutput }
  | { type: 'xstate.done.actor.solanaTransactionSender'; output: TransactionOutput }
  | { type: 'xstate.done.actor.retryDelay'; output: undefined }
  // XState service error events
  | { type: 'xstate.error.actor.ensResolver'; error: Error }
  | { type: 'xstate.error.actor.balanceFetcher'; error: Error }
  | { type: 'xstate.error.actor.networkPriceFetcher'; error: Error }
  | { type: 'xstate.error.actor.evmTransactionSender'; error: Error }
  | { type: 'xstate.error.actor.solanaTransactionSender'; error: Error }
  | { type: 'xstate.error.actor.retryDelay'; error: Error }

export interface BalanceFetchInput {
  address: string
  chainId: string
  chainNamespace: ChainNamespace
}

export interface ENSResolutionInput {
  nameOrAddress: string
  chainNamespace?: ChainNamespace
}

export interface ENSResolutionOutput {
  resolvedAddress: string
  name?: string
  avatar?: string
}

export interface TransactionInput {
  type: 'evm' | 'solana'
  token?: Balance
  amount: number
  to: string
  fromAddress: string
  chainNamespace: ChainNamespace
}

export interface TransactionOutput {
  hash: string
  success: boolean
}

// Internal event types for machine callbacks
export interface ENSResolvedEvent {
  type: 'xstate.done.actor'
  output: ENSResolutionOutput
}

export interface BalanceFetchedEvent {
  type: 'xstate.done.actor'
  output: Balance[]
}

export interface NetworkPriceFetchedEvent {
  type: 'xstate.done.actor'
  output?: string
}

export interface TransactionCompletedEvent {
  type: 'xstate.done.actor'
  output: TransactionOutput
}

export interface ServiceErrorEvent {
  type: 'xstate.error.actor'
  error: Error
}

export interface ValidationErrorEvent {
  type: 'validation.error'
  field: string
  message: string
}

export interface LoadingEvent {
  type: 'loading'
  loading?: boolean
}

// Machine type exports (proper typing will be done after machine creation)
export interface SendMachine {
  context: SendContext
  events: SendEvent
}

export type SendSnapshot = SnapshotFrom<SendMachine>
export type SendActorRef = ActorRefFrom<SendMachine>
