import { z } from 'zod'
import { W3mFrameConstants } from './W3mFrameConstants.js'

// -- Helpers ----------------------------------------------------------------
const zError = z.object({ message: z.string() })

function zType<K extends keyof typeof W3mFrameConstants>(key: K) {
  return z.literal(W3mFrameConstants[key])
}

export const W3mFrameSchema = {
  // -- App Events -----------------------------------------------------------
  appEvent: z
    .object({
      type: zType('APP_SWITCH_NETWORK'),
      payload: z.object({ chainId: z.number() })
    })

    .or(
      z.object({
        type: zType('APP_CONNECT_EMAIL'),
        payload: z.object({ email: z.string().email() })
      })
    )

    .or(
      z.object({
        type: zType('APP_CONNECT_OTP'),
        payload: z.object({ otp: z.string() })
      })
    )

    .or(z.object({ type: zType('APP_GET_USER') }))

    .or(z.object({ type: zType('APP_SIGN_OUT') }))

    .or(z.object({ type: zType('APP_IS_CONNECTED') }))

    .or(z.object({ type: zType('APP_GET_CHAIN_ID') })),

  // -- Frame Events ---------------------------------------------------------
  frameEvent: z
    .object({ type: zType('FRAME_SWITCH_NETWORK_ERROR'), payload: zError })

    .or(z.object({ type: zType('FRAME_SWITCH_NETWORK_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_CONNECT_EMAIL_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_CONNECT_EMAIL_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_CONNECT_OTP_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_CONNECT_OTP_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_GET_USER_ERROR'), payload: zError }))

    .or(
      z.object({
        type: zType('FRAME_GET_USER_SUCCESS'),
        payload: z.object({ address: z.string(), email: z.string().email() })
      })
    )

    .or(z.object({ type: zType('FRAME_SIGN_OUT_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_SIGN_OUT_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_IS_CONNECTED_ERROR'), payload: zError }))

    .or(
      z.object({
        type: zType('FRAME_IS_CONNECTED_SUCCESS'),
        payload: z.object({ isConnected: z.boolean() })
      })
    )

    .or(z.object({ type: zType('FRAME_GET_CHAIN_ID_ERROR'), payload: zError }))

    .or(
      z.object({
        type: zType('FRAME_GET_CHAIN_ID_SUCCESS'),
        payload: z.object({ chainId: z.number() })
      })
    )
}
