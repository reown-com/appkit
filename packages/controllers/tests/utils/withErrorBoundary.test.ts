import { describe, expect, it, vi } from 'vitest'

import { TelemetryController } from '../../src/controllers/TelemetryController.js'
import { AppKitError, withErrorBoundary } from '../../src/utils/withErrorBoundary.js'

// -- Setup --------------------------------------------------------------------
const sendErrorSpy = vi.spyOn(TelemetryController, 'sendError')

// -- Tests --------------------------------------------------------------------
describe('withErrorBoundary', () => {
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
    expect(sendErrorSpy).toHaveBeenCalledWith(expect.any(AppKitError), 'INTERNAL_SDK_ERROR')
  })
})
