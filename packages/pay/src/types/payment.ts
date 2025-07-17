export type PaymentResultStatus = 'SUCCESS' | 'FAILED'

export type PaymentResult = {
  status: PaymentResultStatus
  result?: string
  error?: string
}
