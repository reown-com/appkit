import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse
} from '../utils/TypeUtils.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://rpc.walletconnect.com' })

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
  }
}
