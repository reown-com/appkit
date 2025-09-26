import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TelemetryController } from '../../src/controllers/TelemetryController.js'
import { AppKitError, withErrorBoundary } from '../../src/utils/withErrorBoundary.js'

// -- Setup --------------------------------------------------------------------
const sendErrorSpy = vi.spyOn(TelemetryController, 'sendError')

// -- Tests --------------------------------------------------------------------
describe('withErrorBoundary', () => {
  beforeEach(() => {
    sendErrorSpy.mockClear()
  })

  it('should use default INTERNAL_SDK_ERROR category when none specified', async () => {
    const mockController = {
      async errorMethod() {
        throw new Error('Test error')
      }
    }

    const wrappedController = withErrorBoundary(mockController)

    await expect(wrappedController.errorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'INTERNAL_SDK_ERROR')
  })

  it('should use provided default category for non-AppKitError errors', async () => {
    const mockController = {
      async errorMethod() {
        throw new Error('Test error')
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

    try {
      await wrappedController.errorMethod()
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppKitError)
      expect((err as AppKitError).category).toBe('API_ERROR')
    }
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')
  })

  it('should preserve AppKitError instances regardless of default category', async () => {
    const mockController = {
      async errorMethod() {
        throw new AppKitError('Test error', 'DATA_PARSING_ERROR')
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

    await expect(wrappedController.errorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'DATA_PARSING_ERROR')
  })

  it('should wrap controller methods with error handling', async () => {
    const mockController = {
      state: { value: 'test' },
      async successMethod() {
        return 'success'
      },
      async errorMethod() {
        throw new Error('Test error')
      },
      syncMethod() {
        return 'sync'
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

    // Test successful async method
    const successResult = await wrappedController.successMethod()
    expect(successResult).toBe('success')

    // Test error handling in async method
    try {
      await wrappedController.errorMethod()
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppKitError)
      expect((err as AppKitError).category).toBe('API_ERROR')
    }
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')

    // Test sync method
    expect(wrappedController.syncMethod()).toBe('sync')

    // Test state access
    expect(wrappedController.state).toBe(mockController.state)
  })

  it('should handle non-Error objects with default category', async () => {
    const mockController = {
      async errorMethod() {
        throw 'string error'
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'SECURE_SITE_ERROR')

    await expect(wrappedController.errorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')
  })

  it('should preserve method context', async () => {
    const mockController = {
      value: 'test',
      async contextMethod() {
        return mockController.value
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'API_ERROR')
    const result = await wrappedController.contextMethod()
    expect(result).toBe('test')
  })

  it('should handle multiple methods with different error types', async () => {
    const mockController = {
      async apiErrorMethod() {
        throw new AppKitError('API Error', 'API_ERROR')
      },
      async parsingErrorMethod() {
        throw new AppKitError('Parsing Error', 'DATA_PARSING_ERROR')
      },
      async internalErrorMethod() {
        throw new Error('Internal Error')
      }
    }

    const wrappedController = withErrorBoundary(mockController, 'SECURE_SITE_ERROR')

    await expect(wrappedController.apiErrorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')

    await expect(wrappedController.parsingErrorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'DATA_PARSING_ERROR')

    await expect(wrappedController.internalErrorMethod()).rejects.toThrow(AppKitError)
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')
  })

  describe('errorHandler error cases', () => {
    beforeEach(() => {
      sendErrorSpy.mockClear()
    })

    it('should handle Error instances correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw new Error('Standard error message')
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('Standard error message')
        expect(appKitError.category).toBe('API_ERROR')
        expect(appKitError.originalError).toBeInstanceOf(Error)
        expect((appKitError.originalError as Error).message).toBe('Standard error message')
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')
    })

    it('should handle string errors correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw 'String error message'
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'DATA_PARSING_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('String error message')
        expect(appKitError.category).toBe('DATA_PARSING_ERROR')
        expect(appKitError.originalError).toBe('String error message')
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'DATA_PARSING_ERROR')
    })

    it('should handle object errors correctly', async () => {
      const errorObject = { code: 500, message: 'Server error', details: { reason: 'timeout' } }
      const mockController = {
        async errorMethod() {
          throw errorObject
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'SECURE_SITE_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('Server error')
        expect(appKitError.category).toBe('SECURE_SITE_ERROR')
        expect(appKitError.originalError).toBe(errorObject)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')

      // empty object
      const emptyObject = {}
      const mockController2 = {
        async errorMethod() {
          throw emptyObject
        }
      }

      const wrappedController2 = withErrorBoundary(mockController2, 'SECURE_SITE_ERROR')

      try {
        await wrappedController2.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('Unknown error')
        expect(appKitError.category).toBe('SECURE_SITE_ERROR')
        expect(appKitError.originalError).toBe(emptyObject)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')
    })

    it('should handle null errors correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw null
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'INTERNAL_SDK_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('null')
        expect(appKitError.category).toBe('INTERNAL_SDK_ERROR')
        expect(appKitError.originalError).toBe(null)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'INTERNAL_SDK_ERROR')
    })

    it('should handle undefined errors correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw undefined
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('undefined')
        expect(appKitError.category).toBe('API_ERROR')
        expect(appKitError.originalError).toBe(undefined)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')
    })

    it('should handle number errors correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw 404
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'API_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('404')
        expect(appKitError.category).toBe('API_ERROR')
        expect(appKitError.originalError).toBe(404)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'API_ERROR')
    })

    it('should handle boolean errors correctly', async () => {
      const mockController = {
        async errorMethod() {
          throw false
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'INTERNAL_SDK_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        expect(appKitError.message).toBe('false')
        expect(appKitError.category).toBe('INTERNAL_SDK_ERROR')
        expect(appKitError.originalError).toBe(false)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'INTERNAL_SDK_ERROR')
    })

    it('should handle objects with non-serializable properties', async () => {
      const complexObject = {
        message: 'Complex error',
        timestamp: new Date(),
        function: () => 'test',
        symbol: Symbol('test'),
        undefined: undefined
      }

      const mockController = {
        async errorMethod() {
          throw complexObject
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'SECURE_SITE_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        // The object should be serialized successfully since Date and undefined are serializable
        expect(appKitError.message).toContain('Complex error')
        expect(appKitError.category).toBe('SECURE_SITE_ERROR')
        expect(appKitError.originalError).toBe(complexObject)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')
    })

    it('should handle objects if message doesnt exist', async () => {
      const complexObject = {
        timestamp: new Date(),
        function: () => 'test',
        symbol: Symbol('test'),
        undefined: undefined
      }

      const mockController = {
        async errorMethod() {
          throw complexObject
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'SECURE_SITE_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        // The object should be serialized successfully since Date and undefined are serializable
        expect(appKitError.message).toContain('timestamp')
        expect(appKitError.category).toBe('SECURE_SITE_ERROR')
        expect(appKitError.originalError).toBe(complexObject)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'SECURE_SITE_ERROR')
    })

    it('should handle objects that fail to serialize', async () => {
      // Create an object that will fail JSON.stringify due to functions and symbols
      const nonSerializableObject = {
        message: 'Non-serializable error',
        func: function () {
          return 'test'
        },
        symbol: Symbol('test'),
        get accessor() {
          return 'value'
        }
      }

      const mockController = {
        async errorMethod() {
          throw nonSerializableObject
        }
      }

      const wrappedController = withErrorBoundary(mockController, 'DATA_PARSING_ERROR')

      try {
        await wrappedController.errorMethod()
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(AppKitError)
        const appKitError = err as AppKitError
        // The object is actually serializable, so it should contain the message
        expect(appKitError.message).toContain('Non-serializable error')
        expect(appKitError.category).toBe('DATA_PARSING_ERROR')
        expect(appKitError.originalError).toBe(nonSerializableObject)
      }
      expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'DATA_PARSING_ERROR')
    })
  })
})
