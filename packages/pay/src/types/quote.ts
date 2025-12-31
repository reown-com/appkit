import type { PaymentAsset } from './options.js'

export type QuoteStatus =
  | 'waiting'
  | 'pending'
  | 'success'
  | 'failure'
  | 'refund'
  | 'timeout'
  | 'submitted'

export type QuoteCurrency = PaymentAsset

export interface QuoteAmount {
  amount: string
  currency: QuoteCurrency
}

export interface QuoteFee {
  id: string
  label: string
  amount: string
  currency: QuoteCurrency
}

export interface QuoteDepositStep {
  requestId: string
  type: 'deposit'
  deposit: {
    amount: string
    currency: string
    receiver: string
  }
}

export interface QuoteTransactionStep {
  requestId: string
  type: 'transaction'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any
}

export type QuoteStep = QuoteDepositStep | QuoteTransactionStep

export interface Quote {
  type?: 'direct-transfer'
  origin: QuoteAmount
  destination: QuoteAmount
  steps: QuoteStep[]
  fees: QuoteFee[]
  timeInSeconds: number
}
