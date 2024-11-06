import type { CreateConfigParameters } from '@wagmi/core'
import { authConnector as authConnectorWagmi } from './AuthConnector.js'
import { ErrorUtil } from '@reown/appkit-utils'
import { AlertController } from '@reown/appkit-core'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'

interface W3mFrameProviderOptions {
  projectId: string
}

export type AuthParameters = {
  chains?: CreateConfigParameters['chains']
  options: W3mFrameProviderOptions
}

export function authConnector(parameters: AuthParameters) {
  return authConnectorWagmi({
    ...parameters,
    provider: W3mFrameProviderSingleton.getInstance({
      projectId: parameters.options.projectId,
      onTimeout: () => {
        AlertController.open(ErrorUtil.ALERT_ERRORS.INVALID_APP_CONFIGURATION, 'error')
      }
    })
  })
}
