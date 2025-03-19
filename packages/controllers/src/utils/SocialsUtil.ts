import { AccountController } from '../controllers/AccountController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { EventsController } from '../controllers/EventsController.js'
import { RouterController } from '../controllers/RouterController.js'
import { SnackController } from '../controllers/SnackController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { StorageUtil } from './StorageUtil.js'
import type { SocialProvider } from './TypeUtil.js'

export async function connectFarcaster() {
  RouterController.push('ConnectingFarcaster')
  const authConnector = ConnectorController.getAuthConnector()

  if (authConnector) {
    if (!AccountController.state.farcasterUrl) {
      try {
        const { url } = await authConnector.provider.getFarcasterUri()
        AccountController.setFarcasterUrl(url, ChainController.state.activeChain)
      } catch (error) {
        RouterController.goBack()
        SnackController.showError(error)
      }
    }
  }
}

export async function connectSocial(
  socialProvider: 'google' | 'github' | 'apple' | 'facebook' | 'x' | 'discord'
): Promise<void> {
  RouterController.push('ConnectingSocial')

  const authConnector = ConnectorController.getAuthConnector()

  let popupWindow: Window | null = null

  try {
    if (authConnector && socialProvider) {
      if (!CoreHelperUtil.isTelegram()) {
        popupWindow = CoreHelperUtil.returnOpenHref(
          '',
          'popupWindow',
          'width=600,height=800,scrollbars=yes'
        )
      }

      if (popupWindow) {
        AccountController.setSocialWindow(popupWindow, ChainController.state.activeChain)
      } else if (!CoreHelperUtil.isTelegram()) {
        throw new Error('Something went wrong')
      }

      const { uri } = await authConnector.provider.getSocialRedirectUri({
        provider: socialProvider
      })

      if (!uri) {
        popupWindow?.close()
        throw new Error('Something went wrong')
      }

      if (popupWindow) {
        popupWindow.location.href = uri
      }

      if (CoreHelperUtil.isTelegram()) {
        StorageUtil.setTelegramSocialProvider(socialProvider)
        const parsedUri = CoreHelperUtil.formatTelegramSocialLoginUrl(uri)

        CoreHelperUtil.openHref(parsedUri, '_top')
      }
    }
  } catch (error) {
    popupWindow?.close()
    SnackController.showError('Something went wrong')
  }
}

export async function executeSocialLogin(socialProvider: SocialProvider) {
  AccountController.setSocialProvider(socialProvider, ChainController.state.activeChain)
  EventsController.sendEvent({
    type: 'track',
    event: 'SOCIAL_LOGIN_STARTED',
    properties: { provider: socialProvider }
  })
  if (socialProvider === 'farcaster') {
    await connectFarcaster()
  } else {
    await connectSocial(socialProvider)
  }
}
