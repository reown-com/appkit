import { pino } from '@walletconnect/logger'

export const WalletConnectLoggerUtil = {
  createLogger(onError: (error: Error, ...args: unknown[]) => void, level = 'error') {
    const pinoLogger = pino({ level })

    pinoLogger.error = (...args: unknown[]) => {
      for (const arg of args) {
        if (arg instanceof Error) {
          onError(arg, ...args)
          break
        }
      }

      onError(new Error(), ...args)
    }

    return pinoLogger
  }
}
