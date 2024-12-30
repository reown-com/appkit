export const ErrorUtil = {
  getErrorMessage(error: unknown, fallbackErrMessage?: string) {
    if (error instanceof Error) {
      return error.message
    }

    return fallbackErrMessage ?? 'Unknown Error'
  }
}
