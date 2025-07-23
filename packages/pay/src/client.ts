import { PayController, type PayControllerState } from './controllers/PayController.js'
import { AppKitPayError, AppKitPayErrorCodes } from './types/errors.js'
import type { GetExchangesParams, PayUrlParams, PaymentOptions } from './types/options.js'
import type { PaymentResult } from './types/payment.js'

// 5 minutes
const PAYMENT_TIMEOUT_MS = 300000

export async function openPay(options: PaymentOptions) {
  return PayController.handleOpenPay(options)
}

export async function pay(
  options: PaymentOptions,
  timeoutMs = PAYMENT_TIMEOUT_MS
): Promise<PaymentResult> {
  if (timeoutMs <= 0) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,
      'Timeout must be greater than 0'
    )
  }

  try {
    await openPay(options)
  } catch (error) {
    if (error instanceof AppKitPayError) {
      throw error
    }
    throw new AppKitPayError(
      AppKitPayErrorCodes.UNABLE_TO_INITIATE_PAYMENT,
      (error as Error).message
    )
  }

  return new Promise<PaymentResult>((resolve, reject) => {
    let isSettled = false

    const timeoutId = setTimeout(() => {
      if (isSettled) {
        return
      }
      isSettled = true
      cleanup()
      reject(new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR, 'Payment timeout'))
    }, timeoutMs)

    function checkAndResolve(): void {
      if (isSettled) {
        return
      }

      const currentPayment = PayController.state.currentPayment
      const error = PayController.state.error
      const isInProgress = PayController.state.isPaymentInProgress

      if (currentPayment?.status === 'SUCCESS') {
        isSettled = true
        cleanup()
        clearTimeout(timeoutId)
        resolve({
          success: true,
          result: currentPayment.result
        })

        return
      }

      if (currentPayment?.status === 'FAILED') {
        isSettled = true
        cleanup()
        clearTimeout(timeoutId)
        resolve({
          success: false,
          error: error || 'Payment failed'
        })

        return
      }

      if (error && !isInProgress && !currentPayment) {
        isSettled = true
        cleanup()
        clearTimeout(timeoutId)
        resolve({
          success: false,
          error
        })
      }
    }

    const unsubscribePayment = subscribeStateKey('currentPayment', checkAndResolve)
    const unsubscribeError = subscribeStateKey('error', checkAndResolve)
    const unsubscribeProgress = subscribeStateKey('isPaymentInProgress', checkAndResolve)

    const cleanup = createCleanupHandler([
      unsubscribePayment,
      unsubscribeError,
      unsubscribeProgress
    ])

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

function createCleanupHandler(unsubscribeFunctions: Array<() => void>) {
  return (): void => {
    unsubscribeFunctions.forEach(unsubscribe => {
      try {
        unsubscribe()
      } catch {
        // Ignore cleanup errors
      }
    })
  }
}
