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
  | 5002 // User Rejected Methods
  | 5000 // User Rejected

type RpcProviderError = {
  message: string
  code: ProviderRpcErrorCode
}

// -- Utils ---------------------------------------------------------------- //
export const ErrorUtil = {
  RPC_ERROR_CODE: {
    USER_REJECTED_REQUEST: 4001,
    USER_REJECTED_METHODS: 5002,
    USER_REJECTED: 5000
  } as const,
  PROVIDER_RPC_ERROR_NAME: {
    PROVIDER_RPC: 'ProviderRpcError',
    USER_REJECTED_REQUEST: 'UserRejectedRequestError'
  },
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
  isUserRejectedMessage(message: string) {
    return (
      message.toLowerCase().includes('user rejected') ||
      message.toLowerCase().includes('user cancelled') ||
      message.toLowerCase().includes('user canceled')
    )
  },
  isUserRejectedRequestError(error: unknown) {
    if (ErrorUtil.isRpcProviderError(error)) {
      const isUserRejectedCode = error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST
      const isUserRejectedMethodsCode =
        error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_METHODS

      return (
        isUserRejectedCode ||
        isUserRejectedMethodsCode ||
        ErrorUtil.isUserRejectedMessage(error.message)
      )
    }

    if (error instanceof Error) {
      return ErrorUtil.isUserRejectedMessage(error.message)
    }

    return false
  }
}

// -- Classes ---------------------------------------------------------------- //
export class ProviderRpcError extends Error {
  public code: ProviderRpcErrorCode
  override name = ErrorUtil.PROVIDER_RPC_ERROR_NAME.PROVIDER_RPC

  constructor(cause: unknown, options: RpcProviderError) {
    super(options.message, { cause })
    this.code = options.code
  }
}

export class UserRejectedRequestError extends ProviderRpcError {
  override name = ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST

  constructor(cause: unknown) {
    super(cause, {
      code: ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST,
      message: 'User rejected the request'
    })
  }
}
