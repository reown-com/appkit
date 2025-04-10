import { PayController } from './controllers/PayController.js'
import type { PaymentOptions } from './types/options.js'

export async function openPay(options: PaymentOptions) {
  return PayController.handleOpenPay(options)
}

export function getExchanges() {
  return PayController.getExchanges()
}

export function getPayResult() {
  return PayController.state.payResult
}
export function getPayError() {
  return PayController.state.error
}
export function getIsPaymentInProgress() {
  return PayController.state.isPaymentInProgress
}
