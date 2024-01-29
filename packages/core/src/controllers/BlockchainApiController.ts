import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse
} from '../utils/TypeUtil.js'
import { OptionsController } from './OptionsController.js'

type DestinationWallet = {
  address: string
  blockchains: string[]
  assets: string[]
}

type GenerateOnRampT = {
  destinationWallets: DestinationWallet[]
  partnerUserId: string
  defaultNetwork?: string
}

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

  fetchTransactions({
    account,
    projectId,
    cursor,
    onramp,
    signal
  }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history?projectId=${projectId}${
        onramp ? `&onramp=${onramp}` : ''
      }`,
      params: queryParams,
      signal
    })
  },

  async generateOnRampURL({ destinationWallets, partnerUserId, defaultNetwork }: GenerateOnRampT) {
    const response = await api.post<{ url: string }>({
      path: `/v1/generators/onrampurl?projectId=${OptionsController.state.projectId}`,
      body: {
        destinationWallets,
        defaultNetwork,
        partnerUserId
      }
    })

    return response.url
  }
}
