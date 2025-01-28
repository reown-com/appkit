import SignClient from '@walletconnect/sign-client'

import { createAppKit } from '@reown/appkit'
import { solana } from '@reown/appkit/networks'
import { mainnet } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const signClient = await SignClient.init({
  projectId
})

const modal = createAppKit({
  projectId,
  networks: [mainnet, solana]
})

export { signClient, modal }
