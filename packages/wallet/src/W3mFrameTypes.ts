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
  RpcEthGetBlockTransactionCountByHash,
  RpcEthGetBlockTransactionCountByNumber,
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
  RpcEthGetBlockByHash,
  RpcEthGetCode,
  RpcEthGetFilterChanges,
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
  RpcEthUninstallFilter,
  W3mFrameSchema,
  WalletGetAssetsRequest,
  WalletGetCallsStatusRequest,
  WalletGetCapabilitiesRequest,
  WalletGrantPermissionsRequest,
  WalletRevokePermissionsRequest,
  WalletSendCallsRequest
} from './W3mFrameSchema.js'


const RpcEthGetBlockyByHash = RpcEthGetBlockByHash
const RpcEthGetFilter = RpcEthGetFilterChanges
const RpcUnistallFilter = RpcEthUninstallFilter
const WalletGetCallsReceiptRequest = WalletGetCallsStatusRequest

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

  // Helper type para extrair infer types dos schemas RPC
  type RpcRequestType<T> = z.infer<T>

  export type RPCRequest = (
    | RpcRequestType<typeof RpcEthAccountsRequest>
    | RpcRequestType<typeof RpcEthBlockNumber>
    | RpcRequestType<typeof RpcEthCall>
    | RpcRequestType<typeof RpcEthChainId>
    | RpcRequestType<typeof RpcEthEstimateGas>
    | RpcRequestType<typeof RpcEthFeeHistory>
    | RpcRequestType<typeof RpcEthGasPrice>
    | RpcRequestType<typeof RpcEthGetAccount>
    | RpcRequestType<typeof RpcEthGetBalance>    
    | RpcRequestType<typeof RpcEthGetBlockByHash>
    | RpcRequestType<typeof RpcEthGetBlockyByHash>
    | RpcRequestType<typeof RpcEthGetBlockByNumber>
    | RpcRequestType<typeof RpcEthGetBlockReceipts>
    | RpcRequestType<typeof RpcEthGetBlockTransactionCountByHash>
    | RpcRequestType<typeof RpcEthGetBlockTransactionCountByNumber>
    | RpcRequestType<typeof RpcEthGetCode>    
    | RpcRequestType<typeof RpcEthGetFilterChanges>
    | RpcRequestType<typeof RpcEthGetFilter>
    | RpcRequestType<typeof RpcEthGetFilterLogs>
    | RpcRequestType<typeof RpcEthGetLogs>
    | RpcRequestType<typeof RpcEthGetProof>
    | RpcRequestType<typeof RpcEthGetStorageAt>
    | RpcRequestType<typeof RpcEthGetTransactionByBlockHashAndIndex>
    | RpcRequestType<typeof RpcEthGetTransactionByBlockNumberAndIndex>
    | RpcRequestType<typeof RpcEthGetTransactionByHash>
    | RpcRequestType<typeof RpcEthGetTransactionCount>
    | RpcRequestType<typeof RpcEthGetTransactionReceipt>
    | RpcRequestType<typeof RpcEthGetUncleCountByBlockHash>
    | RpcRequestType<typeof RpcEthGetUncleCountByBlockNumber>
    | RpcRequestType<typeof RpcEthMaxPriorityFeePerGas>
    | RpcRequestType<typeof RpcEthNewBlockFilter>
    | RpcRequestType<typeof RpcEthNewFilter>
    | RpcRequestType<typeof RpcEthNewPendingTransactionFilter>
    | RpcRequestType<typeof RpcEthSendRawTransaction>
    | RpcRequestType<typeof RpcEthSyncing>    
    | RpcRequestType<typeof RpcEthUninstallFilter>
    | RpcRequestType<typeof RpcUnistallFilter>
    | RpcRequestType<typeof RpcPersonalSignRequest>
    | RpcRequestType<typeof RpcEthSignTypedDataV4>
    | RpcRequestType<typeof RpcEthSendTransactionRequest>
    | RpcRequestType<typeof RpcSolanaSignMessageRequest>
    | RpcRequestType<typeof RpcSolanaSignTransactionRequest>
    | RpcRequestType<typeof RpcSolanaSignAllTransactionsRequest>
    | RpcRequestType<typeof RpcSolanaSignAndSendTransactionRequest>
    | RpcRequestType<typeof WalletSendCallsRequest>    
    | RpcRequestType<typeof WalletGetCallsStatusRequest>
    | RpcRequestType<typeof WalletGetCallsReceiptRequest>
    | RpcRequestType<typeof WalletGetCapabilitiesRequest>
    | RpcRequestType<typeof WalletGrantPermissionsRequest>
    | RpcRequestType<typeof WalletRevokePermissionsRequest>
    | RpcRequestType<typeof WalletGetAssetsRequest>
  ) & {
    chainNamespace?: ChainNamespace;
    chainId?: string | number;
    rpcUrl?: string
  }

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

  export type WalletCapabilities = Record<string, unknown>
}

export {
  RpcEthGetBlockyByHash,
  RpcEthGetFilter,
  RpcUnistallFilter,
  WalletGetCallsReceiptRequest
}