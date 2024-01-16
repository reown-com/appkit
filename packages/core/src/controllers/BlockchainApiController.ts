import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiTokensResponse
} from '../utils/TypeUtil.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl()
const api = new FetchUtil({ baseUrl })

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  fetchIdentity({ caipChainId, address }: BlockchainApiIdentityRequest) {
    return api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        chainId: caipChainId,
        projectId: OptionsController.state.projectId
      }
    })
  },

  fetchTokens({ account, projectId, cursor }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTokensResponse>({
      path: `/v1/account/${account}/portfolio?projectId=${projectId}`,
      params: queryParams
    })
  },

  fetchNFTs({ account, projectId, cursor }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history?projectId=${projectId}`,
      params: queryParams
    })
  },

  fetchTransactions({ account, projectId, cursor, onramp }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history?projectId=${projectId}${
        onramp ? `&onramp=${onramp}` : ''
      }`,
      params: queryParams
    })
  }
}
