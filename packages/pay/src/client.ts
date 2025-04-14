import { PayController, type PayControllerState } from './controllers/PayController.js'
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

export type PayControllerPublicState = Pick<
  PayControllerState,
  'isPaymentInProgress' | 'payResult' | 'error' | 'paymentType'
>

export function subscribeStateKey<K extends keyof PayControllerPublicState>(
  key: K,
  callback: (value: PayControllerPublicState[K]) => void
) {
  return PayController.subscribeKey(key, callback)
}
