import { PayController, type PayControllerState } from './controllers/PayController.js'
import type { GetExchangesParams, PayUrlParams, PaymentOptions } from './types/options.js'

export async function openPay(options: PaymentOptions) {
  return PayController.handleOpenPay(options)
}

export function getAvailableExchanges(params?: GetExchangesParams) {
  return PayController.getAvailableExchanges(params)
}

export function getPayUrl(exchangeId: string, params: PayUrlParams) {
  return PayController.getPayUrl(exchangeId, params, true)
}

export function openPayUrl(exchangeId: string, params: PayUrlParams, openInNewTab?: boolean) {
  return PayController.openPayUrl({ exchangeId, openInNewTab }, params, true)
}

export function getExchanges() {
  return PayController.getExchanges()
}

export function getPayResult() {
  return PayController.state.currentPayment?.result
}

export function getPayError() {
  return PayController.state.error
}

export function getIsPaymentInProgress() {
  return PayController.state.isPaymentInProgress
}

export type PayControllerPublicState = Pick<
  PayControllerState,
  'isPaymentInProgress' | 'currentPayment' | 'error'
>

export function subscribeStateKey<K extends keyof PayControllerPublicState>(
  key: K,
  callback: (value: PayControllerPublicState[K]) => void
) {
  return PayController.subscribeKey(key, callback as (value: PayControllerState[K]) => void)
}
