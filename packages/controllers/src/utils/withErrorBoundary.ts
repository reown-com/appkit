import { TelemetryController, TelemetryErrorCategory } from '../controllers/TelemetryController'

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

export function withErrorBoundary<T extends Record<string, any>>(
  controller: T,
  defaultCategory: TelemetryErrorCategory = TelemetryErrorCategory.INTERNAL_SDK_ERROR
): T {
  const newController: Record<string, any> = {}

  Object.keys(controller).forEach((key) => {
    const original = controller[key]

    if (typeof original === 'function') {
      newController[key] = async (...args: any[]) => {
        try {
          const result = await original.apply(controller, args)
          return result
        } catch (err) {
          const error = err instanceof AppKitError
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
    } else {
      newController[key] = original
    }
  })

  return newController as T
} 