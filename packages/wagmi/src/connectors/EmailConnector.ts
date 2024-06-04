import type { CreateConfigParameters } from '@wagmi/core'
import { authConnector } from './AuthConnector.js'
import type { SocialProvider } from '@web3modal/scaffold-utils'

interface W3mFrameProviderOptions {
  projectId: string
}

export type EmailParameters = {
  chains?: CreateConfigParameters['chains']
  options: W3mFrameProviderOptions
  socials?: SocialProvider[]
  showWallets?: boolean
}

export function emailConnector(parameters: EmailParameters) {
  return authConnector({
    ...parameters,
    email: true
  })
}
