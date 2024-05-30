import type { CreateConfigParameters } from '@wagmi/core'
import { authConnector } from './AuthConnector.js'

interface W3mFrameProviderOptions {
  projectId: string
}

export type EmailParameters = {
  chains?: CreateConfigParameters['chains']
  options: W3mFrameProviderOptions
}

export function emailConnector(parameters: EmailParameters) {
  return authConnector({
    ...parameters,
    email: true,
    showWallets: true
  })
}
