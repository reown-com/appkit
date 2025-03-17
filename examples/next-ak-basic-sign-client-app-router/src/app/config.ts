import SignClient from '@walletconnect/sign-client'

import { createAppKit } from '@reown/appkit/core'
import { solana } from '@reown/appkit/networks'
import { mainnet } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

let signClient: InstanceType<typeof SignClient> | undefined
let modal: ReturnType<typeof createAppKit> | undefined

export async function initializeSignClient() {
  // In Next.js, we want to avoid re-initializing on the server side
  if (typeof window === 'undefined') return undefined

  if (!signClient) {
    signClient = await SignClient.init({
      projectId
    })
  }
  return signClient
}

export function initializeModal(client?: InstanceType<typeof SignClient>) {
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
