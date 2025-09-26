import type { TelemetryErrorCategory } from '../controllers/TelemetryController.js'
import { TelemetryController } from '../controllers/TelemetryController.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Controller = Record<string, any>

export class AppKitError extends Error {
  public category: TelemetryErrorCategory
  public originalError: unknown
  public originalName = 'AppKitError'

  constructor(message: string, category: TelemetryErrorCategory, originalError?: unknown) {
    super(message)
    this.name = 'AppKitError'
    this.category = category
    this.originalError = originalError

    if (originalError && originalError instanceof Error) {
      this.originalName = originalError.name
    }

    // Ensure `this instanceof AppKitError` is true, important for custom errors.
    Object.setPrototypeOf(this, AppKitError.prototype)

    let isStackConstructedFromOriginal = false
    if (
      originalError instanceof Error &&
      typeof originalError.stack === 'string' &&
      originalError.stack
    ) {
      const originalErrorStack = originalError.stack
      /**
       * Most error stacks start with "ErrorName: ErrorMessage\n...frames..."
       * We want to take the "...frames..." part.
       */
      const firstNewlineIndex = originalErrorStack.indexOf('\n')

      if (firstNewlineIndex > -1) {
        const originalFrames = originalErrorStack.substring(firstNewlineIndex + 1)
        this.stack = `${this.name}: ${this.message}\n${originalFrames}`
        isStackConstructedFromOriginal = true
      }
    }

    if (!isStackConstructedFromOriginal) {
      /**
       * If stack was not (or could not be) constructed from originalError,
       * generate a standard stack trace for this AppKitError instance.
       * This will point to where `new AppKitError()` was called.
       */
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AppKitError)
      } else if (!this.stack) {
        /**
         * Fallback for environments without Error.captureStackTrace.
         * `super(message)` might have set a stack.
         * If `this.stack` is still undefined/empty, provide a minimal one.
         * Node.js and modern browsers typically set `this.stack` from `super(message)`.
         */
        this.stack = `${this.name}: ${this.message}`
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorHandler(err: any, defaultCategory: TelemetryErrorCategory) {
  let errMessage = ''

  try {
    if (err instanceof Error) {
      errMessage = err.message
    } else if (typeof err === 'string') {
      errMessage = err
    } else if (typeof err === 'object' && err !== null) {
      if (Object.keys(err).length === 0) {
        errMessage = 'Unknown error'
      } else {
        errMessage = err?.message || JSON.stringify(err)
      }
    } else {
      errMessage = String(err)
    }
  } catch (_error) {
    errMessage = 'Unknown error'

    // eslint-disable-next-line no-console
    console.error('Error parsing error message', _error)
  }

  const error = err instanceof AppKitError ? err : new AppKitError(errMessage, defaultCategory, err)

  TelemetryController.sendError(error, error.category)
  throw error
}

export function withErrorBoundary<T extends Controller>(
  controller: T,
  defaultCategory: TelemetryErrorCategory = 'INTERNAL_SDK_ERROR'
): T {
  const newController: Controller = {}

  Object.keys(controller).forEach(key => {
    const original = controller[key]

    if (typeof original === 'function') {
      let wrapped = original

      if (original.constructor.name === 'AsyncFunction') {
        wrapped = async (...args: Parameters<typeof original>) => {
          try {
            return await original(...args)
          } catch (err) {
            return errorHandler(err, defaultCategory)
          }
        }
      } else {
        wrapped = (...args: Parameters<typeof original>) => {
          try {
            return original(...args)
          } catch (err) {
            return errorHandler(err, defaultCategory)
          }
        }
      }

      newController[key] = wrapped
    } else {
      newController[key] = original
    }
  })

  return newController as T
}
