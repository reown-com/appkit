import { z } from 'zod'

import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'

import type { W3mFrameRpcConstants } from './W3mFrameConstants.js'
import {
  AppConnectEmailRequest,
  AppConnectOtpRequest,
  AppConnectSocialRequest,
  AppGetSocialRedirectUriRequest,
  AppGetUserRequest,
  AppSetPreferredAccountRequest,
  AppSwitchNetworkRequest,
  AppSyncDappDataRequest,
  AppSyncThemeRequest,
  AppUpdateEmailPrimaryOtpRequest,
  AppUpdateEmailRequest,
  AppUpdateEmailSecondaryOtpRequest,
  FrameConnectEmailResponse,
  FrameConnectFarcasterResponse,
  FrameConnectSocialResponse,
  FrameGetChainIdResponse,
  FrameGetFarcasterUriResponse,
  FrameGetSmartAccountEnabledNetworksResponse,
  FrameGetSocialRedirectUriResponse,
  FrameGetUserResponse,
  FrameIsConnectedResponse,
  FrameReadyResponse,
  FrameSession,
  FrameSetPreferredAccountResponse,
  FrameSwitchNetworkResponse,
  FrameUpdateEmailResponse,
  FrameUpdateEmailSecondaryOtpResponse,
  RcpEthGetBlockTransactionCountByHash,
  RcpEthGetBlockTransactionCountByNumber,
  RpcEthAccountsRequest,
  RpcEthBlockNumber,
  RpcEthCall,
  RpcEthChainId,
  RpcEthEstimateGas,
  RpcEthFeeHistory,
  RpcEthGasPrice,
  RpcEthGetAccount,
  RpcEthGetBalance,
  RpcEthGetBlockByNumber,
  RpcEthGetBlockReceipts,
  RpcEthGetBlockyByHash,
  RpcEthGetCode,
  RpcEthGetFilter,
  RpcEthGetFilterLogs,
  RpcEthGetLogs,
  RpcEthGetProof,
  RpcEthGetStorageAt,
  RpcEthGetTransactionByBlockHashAndIndex,
  RpcEthGetTransactionByBlockNumberAndIndex,
  RpcEthGetTransactionByHash,
  RpcEthGetTransactionCount,
  RpcEthGetTransactionReceipt,
  RpcEthGetUncleCountByBlockHash,
  RpcEthGetUncleCountByBlockNumber,
  RpcEthMaxPriorityFeePerGas,
  RpcEthNewBlockFilter,
  RpcEthNewFilter,
  RpcEthNewPendingTransactionFilter,
  RpcEthSendRawTransaction,
  RpcEthSendTransactionRequest,
  RpcEthSignTypedDataV4,
  RpcEthSyncing,
  RpcPersonalSignRequest,
  RpcResponse,
  RpcSolanaSignAllTransactionsRequest,
  RpcSolanaSignAndSendTransactionRequest,
  RpcSolanaSignMessageRequest,
  RpcSolanaSignTransactionRequest,
  RpcUnistallFilter,
  W3mFrameSchema,
  WalletGetAssetsRequest,
  WalletGetCallsReceiptRequest,
  WalletGetCapabilitiesRequest,
  WalletGrantPermissionsRequest,
  WalletRevokePermissionsRequest,
  WalletSendCallsRequest
} from './W3mFrameSchema.js'

export namespace W3mFrameTypes {
  export type AppEvent = z.infer<typeof W3mFrameSchema.appEvent>

  export type FrameEvent = z.infer<typeof W3mFrameSchema.frameEvent>

  export interface Requests {
    AppConnectEmailRequest: z.infer<typeof AppConnectEmailRequest>
    AppConnectOtpRequest: z.infer<typeof AppConnectOtpRequest>
    AppGetUserRequest: z.infer<typeof AppGetUserRequest>
    AppSwitchNetworkRequest: z.infer<typeof AppSwitchNetworkRequest>
    AppSyncThemeRequest: z.infer<typeof AppSyncThemeRequest>
    AppSyncDappDataRequest: z.infer<typeof AppSyncDappDataRequest>
    AppUpdateEmailRequest: z.infer<typeof AppUpdateEmailRequest>
    AppUpdateEmailPrimaryOtpRequest: z.infer<typeof AppUpdateEmailPrimaryOtpRequest>
    AppUpdateEmailSecondaryOtpRequest: z.infer<typeof AppUpdateEmailSecondaryOtpRequest>
    AppGetSocialRedirectUriRequest: z.infer<typeof AppGetSocialRedirectUriRequest>
    AppSetPreferredAccountRequest: z.infer<typeof AppSetPreferredAccountRequest>
    AppConnectSocialRequest: z.infer<typeof AppConnectSocialRequest>
    AppGetSmartAccountEnabledNetworksRequest: undefined
    AppGetChainIdRequest: undefined
    AppIsConnectedRequest: undefined
    AppConnectDeviceRequest: undefined
    AppSignOutRequest: undefined
    AppRpcRequest: RPCRequest
    AppGetFarcasterUriRequest: undefined
    AppConnectFarcasterRequest: undefined
    AppRpcAbortRequest: undefined
  }

  export interface Responses {
    FrameConnectEmailResponse: z.infer<typeof FrameConnectEmailResponse>
    FrameConnectOtpResponse: undefined
    FrameGetUserResponse: z.infer<typeof FrameGetUserResponse>
    FrameSwitchNetworkResponse: z.infer<typeof FrameSwitchNetworkResponse>
    FrameGetChainIdResponse: z.infer<typeof FrameGetChainIdResponse>
    FrameIsConnectedResponse: z.infer<typeof FrameIsConnectedResponse>
    FrameGetSmartAccountEnabledNetworksResponse: z.infer<
      typeof FrameGetSmartAccountEnabledNetworksResponse
    >
    FrameUpdateEmailResponse: z.infer<typeof FrameUpdateEmailResponse>
    FrameGetSocialRedirectUriResponse: z.infer<typeof FrameGetSocialRedirectUriResponse>
    FrameConnectSocialResponse: z.infer<typeof FrameConnectSocialResponse>
    FrameGetFarcasterUriResponse: z.infer<typeof FrameGetFarcasterUriResponse>
    FrameConnectFarcasterResponse: z.infer<typeof FrameConnectFarcasterResponse>
    FrameSyncThemeResponse: undefined
    FrameSyncDappDataResponse: undefined
    FrameUpdateEmailPrimaryOtpResponse: undefined
    FrameUpdateEmailSecondaryOtpResponse: z.infer<typeof FrameUpdateEmailSecondaryOtpResponse>
    FrameConnectDeviceResponse: undefined
    FrameSetPreferredAccountResponse: z.infer<typeof FrameSetPreferredAccountResponse>
    FrameSignOutResponse: undefined
    FrameRpcResponse: RPCResponse
    FrameReadyResponse: z.infer<typeof FrameReadyResponse>
    FrameReloadResponse: undefined
    FrameRpcAbortResponse: undefined
  }

  export interface Network {
    rpcUrl: string
    chainId: number | CaipNetworkId
  }

  export type RPCRequest = (
    | z.infer<typeof RpcEthAccountsRequest>
    | z.infer<typeof RpcEthBlockNumber>
    | z.infer<typeof RpcEthCall>
    | z.infer<typeof RpcEthChainId>
    | z.infer<typeof RpcEthEstimateGas>
    | z.infer<typeof RpcEthFeeHistory>
    | z.infer<typeof RpcEthGasPrice>
    | z.infer<typeof RpcEthGetAccount>
    | z.infer<typeof RpcEthGetBalance>
    | z.infer<typeof RpcEthGetBlockyByHash>
    | z.infer<typeof RpcEthGetBlockByNumber>
    | z.infer<typeof RpcEthGetBlockReceipts>
    | z.infer<typeof RcpEthGetBlockTransactionCountByHash>
    | z.infer<typeof RcpEthGetBlockTransactionCountByNumber>
    | z.infer<typeof RpcEthGetCode>
    | z.infer<typeof RpcEthGetFilter>
    | z.infer<typeof RpcEthGetFilterLogs>
    | z.infer<typeof RpcEthGetLogs>
    | z.infer<typeof RpcEthGetProof>
    | z.infer<typeof RpcEthGetStorageAt>
    | z.infer<typeof RpcEthGetTransactionByBlockHashAndIndex>
    | z.infer<typeof RpcEthGetTransactionByBlockNumberAndIndex>
    | z.infer<typeof RpcEthGetTransactionByHash>
    | z.infer<typeof RpcEthGetTransactionCount>
    | z.infer<typeof RpcEthGetTransactionReceipt>
    | z.infer<typeof RpcEthGetUncleCountByBlockHash>
    | z.infer<typeof RpcEthGetUncleCountByBlockNumber>
    | z.infer<typeof RpcEthMaxPriorityFeePerGas>
    | z.infer<typeof RpcEthNewBlockFilter>
    | z.infer<typeof RpcEthNewFilter>
    | z.infer<typeof RpcEthNewPendingTransactionFilter>
    | z.infer<typeof RpcEthSendRawTransaction>
    | z.infer<typeof RpcEthSyncing>
    | z.infer<typeof RpcUnistallFilter>
    | z.infer<typeof RpcPersonalSignRequest>
    | z.infer<typeof RpcEthSignTypedDataV4>
    | z.infer<typeof RpcEthSendTransactionRequest>
    | z.infer<typeof RpcSolanaSignMessageRequest>
    | z.infer<typeof RpcSolanaSignTransactionRequest>
    | z.infer<typeof RpcSolanaSignAllTransactionsRequest>
    | z.infer<typeof RpcSolanaSignAndSendTransactionRequest>
    | z.infer<typeof WalletSendCallsRequest>
    | z.infer<typeof WalletGetCallsReceiptRequest>
    | z.infer<typeof WalletGetCapabilitiesRequest>
    | z.infer<typeof WalletGrantPermissionsRequest>
    | z.infer<typeof WalletRevokePermissionsRequest>
    | z.infer<typeof WalletGetAssetsRequest>
  ) & { chainNamespace?: ChainNamespace; chainId?: string | number; rpcUrl?: string }

  export type RPCResponse = z.infer<typeof RpcResponse>

  export type FrameSessionType = z.infer<typeof FrameSession>
  export type AccountType =
    (typeof W3mFrameRpcConstants.ACCOUNT_TYPES)[keyof typeof W3mFrameRpcConstants.ACCOUNT_TYPES]

  export type SocialProvider = 'google' | 'github' | 'apple' | 'facebook' | 'x' | 'discord'

  export type ProviderRequestType =
    | 'ConnectEmail'
    | 'ConnectOtp'
    | 'GetUser'
    | 'SwitchNetwork'
    | 'GetChainId'
    | 'IsConnected'
    | 'GetSmartAccountEnabledNetworks'
    | 'UpdateEmail'
    | 'GetSocialRedirectUri'
    | 'ConnectSocial'
    | 'GetFarcasterUri'
    | 'ConnectFarcaster'
    | 'SyncTheme'
    | 'SyncDappData'
    | 'UpdateEmailPrimaryOtp'
    | 'UpdateEmailSecondaryOtp'
    | 'ConnectDevice'
    | 'SetPreferredAccount'
    | 'SignOut'
    | 'Rpc'
    | 'Reload'
    | 'RpcAbort'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type WalletCapabilities = Record<string, any>
}
