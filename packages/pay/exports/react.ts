import { useCallback, useEffect, useState } from 'react'

import {
  getPayUrl as clientGetPayUrl,
  openPayUrl as clientOpenPayUrl,
  getAvailableExchanges
} from '../src/client.js'
import { PayController, type PayResult } from '../src/controllers/PayController.js'
import {
  AppKitPayError,
  AppKitPayErrorCodes,
  type AppKitPayErrorMessage
} from '../src/types/errors.js'
import type { Exchange } from '../src/types/exchange.js'
import type { PayUrlParams, PaymentOptions } from '../src/types/options.js'

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

// --- New Hooks ---

interface UseAvailableExchangesReturn {
  /** The fetched exchange data, or null if not yet fetched or an error occurred. */
  data: Exchange[] | null
  /** Indicates if the exchange data is currently being fetched. */
  isLoading: boolean
  /** Stores any error encountered during fetching. Null if no error. */
  error: Error | null
  /** Function to manually trigger fetching exchanges. Can optionally take a page number. */
  fetch: (page?: number) => Promise<void>
}

/**
 * React hook to fetch available exchanges.
 *
 * @param {object} [options] - Optional configuration for the hook.
 * @param {boolean} [options.fetchOnInit=true] - Whether to fetch exchanges when the hook mounts.
 * @param {number} [options.initialPage] - The initial page number to fetch if `fetchOnInit` is true.
 * @returns {UseAvailableExchangesReturn} An object containing the exchange data, loading state, error state, and a function to trigger fetching.
 *
 * @example
 * ```tsx
 * import { useAvailableExchanges } from '@reown/appkit-pay/react';
 *
 * function ExchangeList() {
 *   const { data, isLoading, error, fetch } = useAvailableExchanges();
 *
 *   if (isLoading) return <p>Loading exchanges...</p>;
 *   if (error) return <p>Error loading exchanges: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <button onClick={() => fetch()}>Refresh Exchanges</button>
 *       {data ? (
 *         <ul>
 *           {data.map(exchange => <li key={exchange.id}>{exchange.name}</li>)}
 *         </ul>
 *       ) : (
 *         <p>No exchanges found.</p>
 *       )}
 *     </div>
 *
 *   );
 * }
 * ```
 */
export function useAvailableExchanges(options?: {
  isFetchOnInit?: boolean
  initialPage?: number
}): UseAvailableExchangesReturn {
  const { isFetchOnInit = true, initialPage } = options ?? {}
  const [data, setData] = useState<Exchange[] | null>(null)
  const [isLoading, setIsLoading] = useState(isFetchOnInit)
  const [error, setError] = useState<Error | null>(null)

  const fetchExchanges = useCallback(async (page?: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getAvailableExchanges(page)
      setData(response.exchanges)
    } catch (err) {
      const fetchError =
        err instanceof Error ? err : new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_EXCHANGES)
      setError(fetchError)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isFetchOnInit) {
      fetchExchanges(initialPage).catch(() => {
        // Error is already handled and set in state by fetchExchanges
      })
    }
  }, [isFetchOnInit, initialPage])

  const fetch = useCallback(
    async (page?: number) => {
      await fetchExchanges(page)
    },
    [fetchExchanges]
  )

  return { data, isLoading, error, fetch }
}

/**
 * React hook providing memoized functions for generating and opening pay URLs.
 *
 * @returns {{ getUrl: (exchangeId: string, params: PayUrlParams) => Promise<string>; openUrl: (exchangeId: string, params: PayUrlParams, openInNewTab?: boolean) => void; }} An object containing memoized functions `getUrl` and `openUrl`.
 *
 * @example
 * ```tsx
 * import { usePayUrlActions } from '@reown/appkit-pay/react';
 *
 * function PayActionsComponent({ exchangeId, params }) {
 *   const { getUrl, openUrl } = usePayUrlActions();
 *
 *   const handleGenerateLink = async () => {
 *     try {
 *       const url = await getUrl(exchangeId, params);
 *       console.log('Generated Pay URL:', url);
 *       // You could display this URL or use it in an <a> tag
 *     } catch (error) {
 *       console.error('Failed to generate pay URL:', error);
 *     }
 *   };
 *
 *   const handleOpenLink = () => {
 *     openUrl(exchangeId, params, true); // Opens in a new tab
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleGenerateLink}>Generate Pay Link</button>
 *       <button onClick={handleOpenLink}>Open Pay Link in New Tab</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePayUrlActions(): {
  getUrl: (exchangeId: string, params: PayUrlParams) => Promise<string>
  openUrl: (exchangeId: string, params: PayUrlParams, openInNewTab?: boolean) => void
} {
  const getUrl = useCallback(
    async (exchangeId: string, params: PayUrlParams): Promise<string> =>
      clientGetPayUrl(exchangeId, params),
    []
  )

  const openUrl = useCallback(
    (exchangeId: string, params: PayUrlParams, openInNewTab?: boolean) =>
      clientOpenPayUrl(exchangeId, params, openInNewTab),
    []
  )

  return { getUrl, openUrl }
}
