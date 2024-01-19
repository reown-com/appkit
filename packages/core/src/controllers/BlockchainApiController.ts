import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiOnrampRequest,
  BlockchainApiOnrampResponse
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

  fetchTransactions({ account, projectId, cursor, onramp }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history?projectId=${projectId}${
        onramp ? `&onramp=${onramp}` : ''
      }`,
      params: queryParams
    })
  },

  fetchOnrampUrl({
    destinationWallets,
    partnerUserId,
    defaultNetwork,
    presetCryptoAmount,
    presetFiatAmount,
    defaultExperience,
    handlingRequestedUrls,
    projectId
  }: BlockchainApiOnrampRequest & { projectId: string }) {
    return api.post<BlockchainApiOnrampResponse>({
      path: `/v1/generators/onrampurl?projectID=${projectId}`,
      body: {
        presetCryptoAmount,
        presetFiatAmount,
        defaultExperience,
        handlingRequestedUrls,
        destinationWallets,
        partnerUserId,
        defaultNetwork
      }
    })
  }
}
