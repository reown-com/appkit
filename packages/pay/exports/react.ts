import { useCallback, useEffect, useState } from 'react'

import { PayController, type PayResult } from '../src/controllers/PayController.js'
import type { AppKitPayErrorMessage } from '../src/types/errors.js'
import type { PaymentOptions } from '../src/types/options.js'

/**
 * Represents the state and actions returned by the usePay hook.
 */
interface UsePayReturn {
  /**
   * Function to open the payment modal with the specified options.
   * @param options - The payment configuration options.
   */
  open: (options: PaymentOptions) => Promise<void>

  /**
   * Indicates whether a payment process is currently in progress (e.g., loading exchanges, waiting for transaction).
   * Alias for `isLoading`.
   */
  isPending: boolean

  /**
   * Indicates if the payment process completed successfully.
   */
  isSuccess: boolean

  /**
   * Indicates if the payment process resulted in an error.
   */
  isError: boolean

  /**
   * Stores any error message encountered during the payment process. Null if no error.
   */
  error: AppKitPayErrorMessage | null

  /**
   * Stores the result of a successful payment, typically a transaction hash or identifier. Null if the payment hasn't completed successfully or failed.
   */
  data: PayResult | null
}

/**
 * Parameters for the usePay hook.
 */
interface UsePayParameters {
  /**
   * Callback function triggered when the payment is successful.
   * @param data - The result of the successful payment.
   */
  onSuccess?: (data: PayResult) => void

  /**
   * Callback function triggered when an error occurs during the payment process.
   * @param error - The error message encountered.
   */
  onError?: (error: AppKitPayErrorMessage) => void
}

/**
 * React hook for interacting with the AppKit Pay modal
 *
 * @param {UsePayParameters} [parameters] - Optional configuration for the hook, including success and error callbacks.
 * @returns {UsePayReturn} An object containing the payment state and actions.
 *
 * @example
 * ```tsx
 * import { usePay } from '@reown/appkit-pay/react';
 *
 * function PayButton() {
 *   const { open, isPending, isSuccess, isError, data, error } = usePay({
 *     onSuccess: (result) => console.log('Payment successful:', result),
 *     onError: (err) => console.error('Payment failed:', err),
 *   });
 *
 *   const handlePay = () => {
 *     open({
 *       // Add your payment options here, e.g.:
 *       // paymentAsset: { network: 'eip155:1', recipient: '...', ... },
 *       // redirectUrl: { success: '...', failure: '...' }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handlePay} disabled={isPending}>
 *         {isPending ? 'Processing...' : 'Pay Now'}
 *       </button>
 *       {isError && <p style={{ color: 'red' }}>Error: {error?.message}</p>}
 *       {isSuccess && <p style={{ color: 'green' }}>Payment Successful! Result: {JSON.stringify(data)}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePay(parameters?: UsePayParameters): UsePayReturn {
  const { onSuccess, onError } = parameters ?? {}

  const [isControllerLoading, setIsControllerLoading] = useState(PayController.state.isLoading)
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(
    PayController.state.isPaymentInProgress
  )
  const [error, setError] = useState<AppKitPayErrorMessage | null>(PayController.state.error)
  const [data, setData] = useState<PayResult | null>(PayController.state.payResult ?? null)

  useEffect(() => {
    const unsubLoading = PayController.subscribeKey('isLoading', val => setIsControllerLoading(val))
    const unsubProgress = PayController.subscribeKey('isPaymentInProgress', val =>
      setIsPaymentInProgress(val)
    )

    const unsubError = PayController.subscribeKey('error', val => {
      setError(val)
      if (val && onError) {
        onError(val)
      }
      // Clear data if an error occurs after success
      if (val) {
        setData(null)
      }
    })

    const unsubResult = PayController.subscribeKey('payResult', val => {
      const resultData = val ?? null
      setData(resultData)
      if (resultData && onSuccess) {
        onSuccess(resultData)
      }
      // Clear error if success occurs after an error
      if (resultData) {
        setError(null)
      }
    })

    return () => {
      unsubLoading()
      unsubProgress()
      unsubError()
      unsubResult()
    }
  }, [onSuccess, onError])

  const open = useCallback(async (options: PaymentOptions) => {
    setError(null)
    setData(null)
    await PayController.handleOpenPay(options)
  }, [])

  const isPending = isControllerLoading || isPaymentInProgress
  const isError = error !== null
  const isSuccess = data !== null && !isError

  return {
    open,
    isPending,
    isSuccess,
    isError,
    error,
    data
  }
}
