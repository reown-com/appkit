import { useCallback, useEffect, useState } from 'react'

import { PayController } from '../src/controllers/PayController.js'
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
   */
  isLoading: boolean

  /**
   * Stores any error message encountered during the payment process. Null if no error.
   */
  error: string | null

  /**
   * Stores the result of a successful payment, typically a transaction hash or identifier. Undefined if the payment hasn't completed or failed.
   */
  result: string | undefined
}

/**
 * React hook for interacting with the AppKit Pay modal
 *
 * @returns {UsePayReturn} An object containing:
 *   - `open`: A function to initiate the payment modal.
 *   - `isLoading`: A boolean indicating if a payment operation is in progress.
 *   - `error`: A string containing an error message if an error occurred, otherwise null.
 *   - `result`: A string containing the payment result (e.g., transaction hash) upon success, otherwise undefined.
 *
 * @example
 * ```tsx
 * import { usePay } from '@reown/appkit-pay/react';
 *
 * function PayButton() {
 *   const { open, isLoading, error, result } = usePay();
 *
 *   const handlePay = () => {
 *     open({
 *       paymentAsset: {
 *         network: 'eip155:1', // Example: Ethereum Mainnet
 *         recipient: '0xRecipientAddress...',
 *         asset: 'native', // or '0xTokenAddress...' for ERC20
 *         amount: 1000000000000000000, // Example: 1 ETH in wei
 *         metadata: {
 *           name: 'Ether',
 *           symbol: 'ETH',
 *           decimals: 18
 *         }
 *       },
 *       // Optional configuration
 *       // openInNewTab: true,
 *       // redirectUrl: {
 *         success: 'https://yourapp.com/payment-success',
 *         failure: 'https://yourapp.com/payment-failure'
 *       },
 *       // payWithExchange: {
 *         includeOnly: ['binance'], // Pre-select an exchange
 *         exclude: ['coinbase'] // Exclude an exchange
 *       }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handlePay} disabled={isLoading}>
 *         {isLoading ? 'Processing...' : 'Pay Now'}
 *       </button>
 *       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
 *       {result && <p style={{ color: 'green' }}>Payment Successful! Result: {result}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePay(): UsePayReturn {
  const [isControllerLoading, setIsControllerLoading] = useState(PayController.state.isLoading)
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(
    PayController.state.isPaymentInProgress
  )
  const [error, setError] = useState(PayController.state.error)
  const [result, setResult] = useState(PayController.state.payResult)

  useEffect(() => {
    const unsubLoading = PayController.subscribeKey('isLoading', val => setIsControllerLoading(val))
    const unsubProgress = PayController.subscribeKey('isPaymentInProgress', val =>
      setIsPaymentInProgress(val)
    )
    const unsubError = PayController.subscribeKey('error', val => setError(val))
    const unsubResult = PayController.subscribeKey('payResult', val => setResult(val))

    return () => {
      unsubLoading()
      unsubProgress()
      unsubError()
      unsubResult()
    }
  }, [])

  const open = useCallback(async (options: PaymentOptions) => {
    await PayController.handleOpenPay(options)
  }, [])

  return {
    open,
    isLoading: isControllerLoading || isPaymentInProgress,
    error,
    result
  }
}
