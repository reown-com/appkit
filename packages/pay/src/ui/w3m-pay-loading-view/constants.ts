import type { QuoteStatus } from '../../types/quote.js'

export const STEPS = [
  {
    id: 'received',
    title: 'Receiving funds',
    icon: 'dollar'
  },
  {
    id: 'processing',
    title: 'Swapping asset',
    icon: 'recycleHorizontal'
  },
  {
    id: 'sending',
    title: 'Sending asset to the recipient address',
    icon: 'send'
  }
]

export const TERMINAL_STATES: QuoteStatus[] = [
  'success',
  'submitted',
  'failure',
  'timeout',
  'refund'
]

export type Step = (typeof STEPS)[number]
