import { generatePlatformLogger, getDefaultLoggerOptions } from '@walletconnect/logger'

export const LoggerUtil = {
  createLogger(onError: (error: Error, ...args: unknown[]) => void, level = 'error') {
    const loggerOptions = getDefaultLoggerOptions({
      level
    })

    const { logger } = generatePlatformLogger({
      opts: loggerOptions
    })

    logger.error = (...args: unknown[]) => {
      for (const arg of args) {
        if (arg instanceof Error) {
          onError(arg, ...args)
          break
        }
      }

      onError(new Error(), ...args)
    }

    return logger
  }
}
