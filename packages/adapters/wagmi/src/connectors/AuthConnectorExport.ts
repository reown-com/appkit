import type { CreateConfigParameters } from '@wagmi/core'

import { authConnector as authConnectorWagmi } from './AuthConnector.js'

interface W3mFrameProviderOptions {
  projectId: string
}

export type AuthParameters = {
  chains?: CreateConfigParameters['chains']
  options: W3mFrameProviderOptions
}

export function authConnector(parameters: AuthParameters) {
  return authConnectorWagmi(parameters)
}
