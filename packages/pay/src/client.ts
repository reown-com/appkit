import { PayController, type PayControllerState } from './controllers/PayController.js'
import type { GetExchangesParams, PayUrlParams, PaymentOptions } from './types/options.js'
import type { PaymentResult } from './types/payment.js'

// 5 minutes
const PAYMENT_TIMEOUT_MS = 300000

export async function openPay(options: PaymentOptions) {
  return PayController.handleOpenPay(options)
}

export async function pay(options: PaymentOptions, timeoutMs = PAYMENT_TIMEOUT_MS) {
  await openPay(options)

  return new Promise<PaymentResult>((resolve, reject) => {
    let cleanup: (() => void) | null = null

    const timeoutId = setTimeout(() => {
      cleanup?.()
      reject(new Error('Payment timeout'))
    }, timeoutMs)

    function checkAndResolve(): void {
      const currentPayment = PayController.state.currentPayment
      const error = PayController.state.error
      const isInProgress = PayController.state.isPaymentInProgress

      if (currentPayment?.status === 'SUCCESS') {
        cleanup?.()
        clearTimeout(timeoutId)
        resolve({
          status: 'SUCCESS',
          result: currentPayment.result
        })
      } else if (currentPayment?.status === 'FAILED' || (error && !isInProgress)) {
        cleanup?.()
        clearTimeout(timeoutId)
        resolve({
          status: 'FAILED',
          error: error || 'Payment failed'
        })
      }
    }

    const unsubscribePayment = subscribeStateKey('currentPayment', checkAndResolve)
    const unsubscribeError = subscribeStateKey('error', checkAndResolve)
    const unsubscribeProgress = subscribeStateKey('isPaymentInProgress', checkAndResolve)

    cleanup = (): void => {
      unsubscribePayment()
      unsubscribeError()
      unsubscribeProgress()
    }

    // Check immediately in case already completed
    checkAndResolve()
  })
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
