import type { PaymentAsset } from './options.js'

export interface QuoteFee {
  id: string
  label: string
  amount: string
  amountFormatted: string
  chainId: string
  amountUsd: string
  currency: PaymentAsset
}

export interface QuoteCurrency {
  amount: string
  amountFormatted: string
  chainId: string
  symbol?: string
  decimals?: number
}

export type QuoteStatus =
  | 'waiting'
  | 'pending'
  | 'success'
  | 'failure'
  | 'refund'
  | 'timeout'
  | 'submitted'

export interface Quote {
  type: 'same-chain' | 'cross-chain'
  origin: QuoteCurrency
  destination: QuoteCurrency
  fees: QuoteFee[]
  requestId: string
  depositAddress: string
  timeEstimate: number
}
