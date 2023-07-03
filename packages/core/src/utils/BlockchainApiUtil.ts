import { ConfigCtrl } from '../controllers/ConfigCtrl'

// -- Constants -------------------------------------------------------
export const NAMESPACE = 'eip155'
const BLOCKCHAIN_API = 'https://rpc.walletconnect.com'

// -- Utility -------------------------------------------------------
export const BlockchainApiUtil = {
  async getIdentity(
    address: string,
    chainId: number
  ): Promise<{ name: string; avatar?: string } | null> {
    const { projectId } = ConfigCtrl.state
    const chain_id = `${NAMESPACE}:${chainId}`
    const endpoint = `${BLOCKCHAIN_API}/v1/identity/${address}?chainId=${chain_id}&projectId=${projectId}`

    const response = await fetch(endpoint)
    if (response.status === 404) {
      // Profile not found
      return null
    } else if (response.status !== 200) {
      throw new Error('Problem resolving profile: ' + response.status)
    } else {
      return response.json()
    }
  }
}
