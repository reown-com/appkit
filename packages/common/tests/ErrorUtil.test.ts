import { describe, expect, it } from 'vitest'

import { ErrorUtil, ProviderRpcError, UserRejectedRequestError } from '../src/utils/ErrorUtil'

describe('ErrorUtil', () => {
  describe('isRpcProviderError', () => {
    it('returns true for valid RpcProviderError shape', () => {
      const error = { message: 'Some message', code: 4900 }
      expect(ErrorUtil.isRpcProviderError(error)).toBe(true)
    })

    it('returns false when message is missing', () => {
      const error = { code: 4900 }
      expect(ErrorUtil.isRpcProviderError(error)).toBe(false)
    })

    it('returns false when code is missing', () => {
      const error = { message: 'Some message' }
      expect(ErrorUtil.isRpcProviderError(error)).toBe(false)
    })

    it('returns false for non-object inputs', () => {
      expect(ErrorUtil.isRpcProviderError(null)).toBe(false)
      expect(ErrorUtil.isRpcProviderError(undefined)).toBe(false)
      expect(ErrorUtil.isRpcProviderError('error')).toBe(false)
      expect(ErrorUtil.isRpcProviderError(4001)).toBe(false)
      expect(ErrorUtil.isRpcProviderError(true)).toBe(false)
      expect(ErrorUtil.isRpcProviderError(BigInt(0))).toBe(false)
      expect(ErrorUtil.isRpcProviderError(new Error('test'))).toBe(false)
    })
  })

  describe('isUserRejectedRequestError', () => {
    it('returns true when code is USER_REJECTED_REQUEST (4001)', () => {
      const error = { message: 'Denied', code: ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST }
      expect(ErrorUtil.isUserRejectedRequestError(error)).toBe(true)
    })

    it('returns true when message includes "user rejected" (case-insensitive)', () => {
      const errorLower = { message: 'user rejected the action', code: 4100 }
      const errorMixed = { message: 'User Rejected request', code: 4200 }
      expect(ErrorUtil.isUserRejectedRequestError(errorLower)).toBe(true)
      expect(ErrorUtil.isUserRejectedRequestError(errorMixed)).toBe(true)
    })

    it('returns false when neither code nor message indicates user rejection', () => {
      const error = { message: 'Some other error', code: 4200 }
      expect(ErrorUtil.isUserRejectedRequestError(error)).toBe(false)
    })

    it('returns false for non RpcProviderError inputs', () => {
      expect(ErrorUtil.isUserRejectedRequestError({ code: 4001 })).toBe(false)
      expect(ErrorUtil.isUserRejectedRequestError({ message: 'user rejected' })).toBe(false)
      expect(ErrorUtil.isUserRejectedRequestError('user rejected')).toBe(false)
      expect(ErrorUtil.isUserRejectedRequestError(BigInt(0))).toBe(false)
      expect(ErrorUtil.isUserRejectedRequestError(new Error('test'))).toBe(false)
    })

    it('returns true for Error instance with user rejection phrasing in message', () => {
      expect(ErrorUtil.isUserRejectedRequestError(new Error('User rejected the operation'))).toBe(
        true
      )
      expect(ErrorUtil.isUserRejectedRequestError(new Error('User cancelled the operation'))).toBe(
        true
      )
    })
  })

  describe('Error classes', () => {
    it('ProviderRpcError sets message and code', () => {
      const cause = new Error('original')
      const err = new ProviderRpcError(cause, { message: 'boom', code: 4900 })
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('boom')
      expect(err.code).toBe(4900)
      expect(err.cause).toBe(cause)
      expect(err.name).toBe('ProviderRpcError')
    })

    it('UserRejectedRequestError sets proper name, code and message', () => {
      const cause = new Error('original')
      const err = new UserRejectedRequestError(cause)
      expect(err.name).toBe('UserRejectedRequestError')
      expect(err.message).toBe('User rejected the request')
      expect(err.code).toBe(ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST)
      expect(err.name).toBe('UserRejectedRequestError')
    })
  })
})
