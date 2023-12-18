import { z } from 'zod'
import {
  W3mFrameSchema,
  AppConnectEmailRequest,
  AppConnectOtpRequest,
  AppSwitchNetworkRequest,
  FrameConnectEmailResponse,
  FrameGetChainIdResponse,
  FrameGetUserResponse,
  FrameIsConnectedResponse,
  RpcPersonalSignRequest,
  RpcResponse,
  RpcEthSendTransactionRequest,
  RpcEthSignTypedDataV4,
  RpcEthAccountsRequest,
  RpcEthEstimateGas,
  RpcEthGasPrice,
  RpcGetBalance,
  FrameSession,
  AppGetUserRequest
} from './W3mFrameSchema.js'

export namespace W3mFrameTypes {
  export type AppEvent = z.infer<typeof W3mFrameSchema.appEvent>

  export type FrameEvent = z.infer<typeof W3mFrameSchema.frameEvent>

  export interface Requests {
    AppConnectEmailRequest: z.infer<typeof AppConnectEmailRequest>
    AppConnectOtpRequest: z.infer<typeof AppConnectOtpRequest>
    AppSwitchNetworkRequest: z.infer<typeof AppSwitchNetworkRequest>
    AppGetUserRequest: z.infer<typeof AppGetUserRequest>
  }

  export interface Responses {
    FrameConnectEmailResponse: z.infer<typeof FrameConnectEmailResponse>
    FrameGetChainIdResponse: z.infer<typeof FrameGetChainIdResponse>
    FrameGetUserResponse: z.infer<typeof FrameGetUserResponse>
    FrameIsConnectedResponse: z.infer<typeof FrameIsConnectedResponse>
  }

  export interface Network {
    rpcUrl: string
    chainId: number
  }

  export type RPCRequest =
    | z.infer<typeof RpcPersonalSignRequest>
    | z.infer<typeof RpcEthSendTransactionRequest>
    | z.infer<typeof RpcEthSignTypedDataV4>
    | z.infer<typeof RpcEthAccountsRequest>
    | z.infer<typeof RpcEthEstimateGas>
    | z.infer<typeof RpcEthGasPrice>
    | z.infer<typeof RpcGetBalance>

  export type RPCResponse = z.infer<typeof RpcResponse>

  export type FrameSessionType = z.infer<typeof FrameSession>
}
