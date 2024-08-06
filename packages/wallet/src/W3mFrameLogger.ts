import {
  generateChildLogger,
  generatePlatformLogger,
  getDefaultLoggerOptions,
  type ChunkLoggerController,
  type Logger
} from '@walletconnect/logger'
import { DEFAULT_LOG_LEVEL } from './W3mFrameConstants.js'

export class W3mFrameLogger {
  public logger: Logger

  public chunkLoggerController: ChunkLoggerController | null

  constructor(projectId: string) {
    const loggerOptions = getDefaultLoggerOptions({
      level: DEFAULT_LOG_LEVEL
    })

    const { logger, chunkLoggerController } = generatePlatformLogger({
      opts: loggerOptions
    })
    this.logger = generateChildLogger(logger, this.constructor.name)
    this.chunkLoggerController = chunkLoggerController

    if (typeof window !== 'undefined' && this.chunkLoggerController?.downloadLogsBlobInBrowser) {
      // @ts-expect-error any
      if (!window.downloadAppKitLogsBlob) {
        // @ts-expect-error any
        window.downloadAppKitLogsBlob = {}
      }
      // @ts-expect-error any
      window.downloadAppKitLogsBlob['sdk'] = () => {
        if (this.chunkLoggerController?.downloadLogsBlobInBrowser) {
          this.chunkLoggerController.downloadLogsBlobInBrowser({
            projectId
          })
        }
      }
    }
  }
}
