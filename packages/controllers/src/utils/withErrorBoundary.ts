import { TelemetryController, TelemetryErrorCategory } from '../controllers/TelemetryController.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Controller = Record<string, any>

export class AppKitError extends Error {
  public category: TelemetryErrorCategory
  public originalError: unknown

  constructor(message: string, category: TelemetryErrorCategory, originalError?: unknown) {
    super(message)
    this.name = 'AppKitError'
    this.category = category
    this.originalError = originalError

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppKitError)
    }
  }
}

export function withErrorBoundary<T extends Controller>(
  controller: T,
  defaultCategory: TelemetryErrorCategory = TelemetryErrorCategory.INTERNAL_SDK_ERROR
): T {
  const newController: Controller = {}

  Object.keys(controller).forEach(key => {
    const original = controller[key]

    if (typeof original === 'function') {
      // eslint-disable-next-line func-style
      const wrapped = (...args: Parameters<typeof original>) => {
        try {
          const result = original.apply(controller, args)

          return result
        } catch (err) {
          const error =
            err instanceof AppKitError
              ? err
              : new AppKitError(
                  err instanceof Error ? err.message : String(err),
                  defaultCategory,
                  err
                )

          TelemetryController.sendError(error, error.category)
          throw error
        }
      }

      newController[key] = wrapped
    } else {
      newController[key] = original
    }
  })

  return newController as T
}
