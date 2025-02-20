import SignClient from '@walletconnect/sign-client'

import { createAppKit } from '@reown/appkit/basic'
import { solana } from '@reown/appkit/networks'
import { mainnet } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

let signClient: InstanceType<typeof SignClient> | undefined
let modal: ReturnType<typeof createAppKit> | undefined

export async function initializeSignClient() {
  if (!signClient) {
    signClient = await SignClient.init({
      projectId
    })
  }
  return signClient
}

export function initializeModal() {
  if (!modal) {
    modal = createAppKit({
      projectId,
      manualWCControl: true,
      networks: [mainnet, solana]
    })
  }
  return modal
}

export { signClient, modal }
