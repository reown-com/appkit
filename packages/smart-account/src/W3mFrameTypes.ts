import { z } from 'zod'
import type { W3mFrame } from './W3mFrame.js'

export namespace W3mFrameTypes {
  export type AppEvent = z.infer<W3mFrame['schema']['appEvent']>

  export type FrameEvent = z.infer<W3mFrame['schema']['frameEvent']>

  export interface Network {
    rpcUrl: string
    chainId: number
  }
}
