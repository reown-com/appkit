/* eslint-disable max-classes-per-file */
/* eslint-disable line-comment-position */
/* eslint-disable no-inline-comments */

// -- Types ------------------------------------------------------------------- //
export type ProviderRpcErrorCode =
  | 4001 // User Rejected Request
  | 4100 // Unauthorized
  | 4200 // Unsupported Method
  | 4900 // Disconnected
  | 4901 // Chain Disconnected
  | 4902 // Chain Not Recognized
  | 5710 // Unsupported chain id

type RpcProviderError = {
  message: string
  code: ProviderRpcErrorCode
}

// -- Classes ---------------------------------------------------------------- //
export class ProviderRpcError extends Error {
  public code: ProviderRpcErrorCode

  constructor(cause: unknown, options: RpcProviderError) {
    super(options.message, { cause })
    this.code = options.code
  }
}

export class UserRejectedRequestError extends ProviderRpcError {
  override name = 'UserRejectedRequestError'

  constructor(cause: unknown) {
    super(cause, {
      code: ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST,
      message: 'User rejected the request'
    })
  }
}

// -- Utils ---------------------------------------------------------------- //
export const ErrorUtil = {
  RPC_ERROR_CODE: {
    USER_REJECTED_REQUEST: 4001
  } as const,
  isRpcProviderError(error: unknown): error is RpcProviderError {
    try {
      if (typeof error === 'object' && error !== null) {
        const objErr = error as Record<string, unknown>

        const hasMessage = typeof objErr['message'] === 'string'
        const hasCode = typeof objErr['code'] === 'number'

        return hasMessage && hasCode
      }

      return false
    } catch {
      return false
    }
  },
  isUserRejectedRequestError(error: unknown) {
    if (ErrorUtil.isRpcProviderError(error)) {
      const isUserRejectedCode = error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST
      const isUserRejectedMessage = error.message.toLowerCase().includes('user rejected')

      return isUserRejectedCode || isUserRejectedMessage
    }

    return false
  }
}
