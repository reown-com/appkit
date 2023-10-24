import { z } from 'zod'
import { W3mFrameSchema } from './W3mFrameSchema.js'

export namespace W3mFrameTypes {
  export type AppEvent = z.infer<typeof W3mFrameSchema.appEvent>

  export type FrameEvent = z.infer<typeof W3mFrameSchema.frameEvent>

  export interface Network {
    rpcUrl: string
    chainId: number
  }
}
