import { z } from 'zod'
import { W3mFrameConstants } from './W3mFrameConstants.js'

// -- Helpers ----------------------------------------------------------------
const zError = z.object({ message: z.string() })

function zType<K extends keyof typeof W3mFrameConstants>(key: K) {
  return z.literal(W3mFrameConstants[key])
}

// -- Responses --------------------------------------------------------------
export const AppSwitchNetworkRequest = z.object({ chainId: z.number() })
export const AppConnectEmailRequest = z.object({ email: z.string().email() })
export const AppConnectOtpRequest = z.object({ otp: z.string() })
export const AppGetUserRequest = z.object({ chainId: z.optional(z.number()) })
export const AppUpdateEmailRequest = z.object({ email: z.string().email() })
export const AppSyncThemeRequest = z.object({
  themeMode: z.optional(z.enum(['light', 'dark'])),
  themeVariables: z.optional(z.record(z.string(), z.string().or(z.number())))
})
export const FrameConnectEmailResponse = z.object({
  action: z.enum(['VERIFY_DEVICE', 'VERIFY_OTP'])
})
export const FrameGetUserResponse = z.object({
  email: z.string().email(),
  address: z.string(),
  chainId: z.number()
})
export const FrameIsConnectedResponse = z.object({ isConnected: z.boolean() })
export const FrameGetChainIdResponse = z.object({ chainId: z.number() })
export const FrameAwaitUpdateEmailResponse = z.object({ email: z.string().email() })
export const RpcResponse = z.string()
export const RpcPersonalSignRequest = z.object({
  method: z.literal('personal_sign'),
  params: z.array(z.any())
})
export const RpcEthSendTransactionRequest = z.object({
  method: z.literal('eth_sendTransaction'),
  params: z.array(z.any())
})
export const RpcEthAccountsRequest = z.object({
  method: z.literal('eth_accounts')
})
export const RpcGetBalance = z.object({
  method: z.literal('eth_getBalance'),
  params: z.array(z.any())
})
export const RpcEthEstimateGas = z.object({
  method: z.literal('eth_estimateGas'),
  params: z.array(z.any())
})
export const RpcEthGasPrice = z.object({
  method: z.literal('eth_gasPrice')
})
export const RpcEthSignTypedDataV4 = z.object({
  method: z.literal('eth_signTypedData_v4'),
  params: z.array(z.any())
})
export const RpcEthBlockNumber = z.object({
  method: z.literal('eth_blockNumber')
})

export const RpcEthChainId = z.object({
  method: z.literal('eth_chainId')
})

export const FrameSession = z.object({
  token: z.string()
})

export const W3mFrameSchema = {
  // -- App Events -----------------------------------------------------------

  appEvent: z
    .object({ type: zType('APP_SWITCH_NETWORK'), payload: AppSwitchNetworkRequest })

    .or(z.object({ type: zType('APP_CONNECT_EMAIL'), payload: AppConnectEmailRequest }))

    .or(z.object({ type: zType('APP_CONNECT_DEVICE') }))

    .or(z.object({ type: zType('APP_CONNECT_OTP'), payload: AppConnectOtpRequest }))

    .or(z.object({ type: zType('APP_GET_USER'), payload: z.optional(AppGetUserRequest) }))

    .or(z.object({ type: zType('APP_SIGN_OUT') }))

    .or(z.object({ type: zType('APP_IS_CONNECTED'), payload: z.optional(FrameSession) }))

    .or(z.object({ type: zType('APP_GET_CHAIN_ID') }))

    .or(
      z.object({
        type: zType('APP_RPC_REQUEST'),
        payload: RpcPersonalSignRequest.or(RpcEthSendTransactionRequest)
          .or(RpcEthAccountsRequest)
          .or(RpcGetBalance)
          .or(RpcEthEstimateGas)
          .or(RpcEthGasPrice)
          .or(RpcEthSignTypedDataV4)
          .or(RpcEthBlockNumber)
          .or(RpcEthChainId)
      })
    )

    .or(z.object({ type: zType('APP_UPDATE_EMAIL'), payload: AppUpdateEmailRequest }))

    .or(z.object({ type: zType('APP_AWAIT_UPDATE_EMAIL') }))

    .or(z.object({ type: zType('APP_SYNC_THEME'), payload: AppSyncThemeRequest })),

  // -- Frame Events ---------------------------------------------------------
  frameEvent: z
    .object({ type: zType('FRAME_SWITCH_NETWORK_ERROR'), payload: zError })

    .or(z.object({ type: zType('FRAME_SWITCH_NETWORK_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_CONNECT_EMAIL_ERROR'), payload: zError }))

    .or(
      z.object({ type: zType('FRAME_CONNECT_EMAIL_SUCCESS'), payload: FrameConnectEmailResponse })
    )

    .or(z.object({ type: zType('FRAME_CONNECT_OTP_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_CONNECT_OTP_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_CONNECT_DEVICE_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_CONNECT_DEVICE_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_GET_USER_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_GET_USER_SUCCESS'), payload: FrameGetUserResponse }))

    .or(z.object({ type: zType('FRAME_SIGN_OUT_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_SIGN_OUT_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_IS_CONNECTED_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_IS_CONNECTED_SUCCESS'), payload: FrameIsConnectedResponse }))

    .or(z.object({ type: zType('FRAME_GET_CHAIN_ID_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_GET_CHAIN_ID_SUCCESS'), payload: FrameGetChainIdResponse }))

    .or(z.object({ type: zType('FRAME_RPC_REQUEST_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_RPC_REQUEST_SUCCESS'), payload: RpcResponse }))

    .or(z.object({ type: zType('FRAME_SESSION_UPDATE'), payload: FrameSession }))

    .or(z.object({ type: zType('FRAME_UPDATE_EMAIL_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_UPDATE_EMAIL_SUCCESS') }))

    .or(z.object({ type: zType('FRAME_AWAIT_UPDATE_EMAIL_ERROR'), payload: zError }))

    .or(
      z.object({
        type: zType('FRAME_AWAIT_UPDATE_EMAIL_SUCCESS'),
        payload: FrameAwaitUpdateEmailResponse
      })
    )

    .or(z.object({ type: zType('FRAME_SYNC_THEME_ERROR'), payload: zError }))

    .or(z.object({ type: zType('FRAME_SYNC_THEME_SUCCESS') }))
}
