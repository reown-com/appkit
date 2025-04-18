import { useCallback, useEffect, useRef, useState } from 'react'

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
import type { PayUrlParams, PayUrlResponse, PaymentOptions } from '../src/types/options.js'

const MINIMUM_POLLING_INTERVAL = 3000
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
  const [data, setData] = useState<PayResult | null>(
    PayController.state.currentPayment?.result ?? null
  )

  useEffect(() => {
    const unsubLoading = PayController.subscribeKey('isLoading', val => setIsControllerLoading(val))
    const unsubProgress = PayController.subscribeKey('isPaymentInProgress', val => {
      setIsPaymentInProgress(val)
      const payResult = PayController.state.currentPayment?.result ?? null
      setData(payResult)
      if (payResult && onSuccess) {
        onSuccess(payResult)
      }
      // Clear error if success occurs after an error
      if (payResult) {
        setError(null)
      }
    })

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

    return () => {
      unsubLoading()
      unsubProgress()
      unsubError()
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
  getUrl: (exchangeId: string, params: PayUrlParams) => Promise<PayUrlResponse>
  openUrl: (
    exchangeId: string,
    params: PayUrlParams,
    openInNewTab?: boolean
  ) => Promise<PayUrlResponse>
} {
  const getUrl = useCallback(
    async (exchangeId: string, params: PayUrlParams): Promise<PayUrlResponse> =>
      clientGetPayUrl(exchangeId, params),
    []
  )

  const openUrl = useCallback(
    async (exchangeId: string, params: PayUrlParams, openInNewTab?: boolean) =>
      clientOpenPayUrl(exchangeId, params, openInNewTab),
    []
  )

  return { getUrl, openUrl }
}

// --- New Hook: useExchangeBuyStatus ---

/** Represents the status response from the getBuyStatus API. */
export interface ExchangeBuyStatus {
  status: 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'
  txHash?: string
}

/** Parameters for the useExchangeBuyStatus hook. */
interface UseExchangeBuyStatusParameters {
  /** The ID of the exchange. */
  exchangeId: string
  /** The session ID for the buy transaction. */
  sessionId: string
  /** Optional polling interval in milliseconds. If set, the hook will poll for status updates. Defaults to `undefined` (no polling). */
  pollingInterval?: number
  /** Whether the hook is enabled and should start fetching/polling. Defaults to `true`. */
  isEnabled?: boolean
  /** Callback function triggered when the status is successfully fetched or updated. */
  onSuccess?: (data: ExchangeBuyStatus) => void
  /** Callback function triggered when an error occurs during fetching. */
  onError?: (error: Error) => void
}

/** Return value of the useExchangeBuyStatus hook. */
interface UseExchangeBuyStatusReturn {
  /** The fetched buy status data, or null if not yet fetched or an error occurred. */
  data: ExchangeBuyStatus | null
  /**
   * Indicates if the status is currently being fetched for the first time or via manual refetch.
   * Does not indicate background polling activity.
   */
  isLoading: boolean
  /** Stores any error encountered during fetching. Null if no error. */
  error: Error | null
  /** Function to manually trigger fetching the status. Shows loading indicator. */
  refetch: () => Promise<void>
}

/**
 * React hook to fetch and optionally poll the status of an exchange buy transaction.
 * Provides improved readability and separation of concerns for fetching and polling logic.
 *
 * @param {UseExchangeBuyStatusParameters} params - Parameters including exchangeId, sessionId, and optional polling configuration.
 * @returns {UseExchangeBuyStatusReturn} An object containing the status data, loading state, error state, and a refetch function.
 *
 * @example
 * ```tsx
 * import { useExchangeBuyStatus } from '@reown/appkit-pay/react';
 *
 * function BuyStatusChecker({ exchangeId, sessionId }) {
 *   const { data, isLoading, error, refetch } = useExchangeBuyStatus({
 *     exchangeId,
 *     sessionId,
 *     pollingInterval: 5000, // Poll every 5 seconds
 *     onSuccess: (statusData) => console.log('Status updated:', statusData),
 *     onError: (err) => console.error('Error fetching status:', err),
 *   });
 *
 *   if (isLoading && !data) return <p>Loading initial status...</p>; // Show initial loading indicator
 *   if (error) return <p>Error fetching status: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <p>Current Status: {data?.status ?? 'Unknown'}</p>
 *       {data?.txHash && <p>Transaction Hash: {data.txHash}</p>}
 *       {isLoading && <p> (Checking status...)</p>}
 *       <button onClick={refetch} disabled={isLoading}>Refresh Status</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExchangeBuyStatus(
  params: UseExchangeBuyStatusParameters
): UseExchangeBuyStatusReturn {
  const { exchangeId, sessionId, pollingInterval, isEnabled = true, onSuccess, onError } = params
  const [data, setData] = useState<ExchangeBuyStatus | null>(null)
  const [isLoading, setIsLoading] = useState(isEnabled)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Internal function to fetch the status, update state, and handle callbacks.
   * @param options - Configuration for the fetch operation.
   * @param options.showLoading - Whether to set the `isLoading` state during this fetch.
   * @returns The fetched status or throws an error.
   */
  const fetchAndSetStatus = useCallback(
    async (options: { showLoading: boolean }): Promise<ExchangeBuyStatus> => {
      if (options.showLoading) {
        setIsLoading(true)
      }
      if (options.showLoading) {
        setError(null)
      }

      try {
        const status = await PayController.getBuyStatus(exchangeId, sessionId)
        setData(status)
        setError(null)
        if (onSuccess) {
          onSuccess(status)
        }

        return status
      } catch (err) {
        const fetchError =
          err instanceof Error
            ? err
            : new AppKitPayError(AppKitPayErrorCodes.UNABLE_TO_GET_BUY_STATUS)
        setError(fetchError)
        if (onError) {
          onError(fetchError)
        }
        throw fetchError
      } finally {
        if (options.showLoading) {
          setIsLoading(false)
        }
      }
    },
    [exchangeId, sessionId, onSuccess, onError]
  )

  useEffect(() => {
    if (isEnabled) {
      fetchAndSetStatus({ showLoading: true })
    } else {
      setData(null)
      setError(null)
      setIsLoading(false)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEnabled, exchangeId, sessionId])

  useEffect(() => {
    const isTerminalStatus = data?.status === 'SUCCESS' || data?.status === 'FAILED'
    const shouldPoll = isEnabled && pollingInterval && pollingInterval > 0 && !isTerminalStatus

    function clearPollingInterval() {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    if (shouldPoll) {
      clearPollingInterval()
      const interval =
        pollingInterval < MINIMUM_POLLING_INTERVAL ? MINIMUM_POLLING_INTERVAL : pollingInterval
      intervalRef.current = setInterval(() => {
        fetchAndSetStatus({ showLoading: false }).catch(() => {
          clearPollingInterval()
        })
      }, interval)
    } else {
      clearPollingInterval()
    }

    return clearPollingInterval
  }, [isEnabled, pollingInterval, data?.status])

  const refetch = useCallback(async () => {
    if (!isEnabled) {
      return
    }
    await fetchAndSetStatus({ showLoading: true })
  }, [fetchAndSetStatus, isEnabled])

  return { data, isLoading, error, refetch }
}
