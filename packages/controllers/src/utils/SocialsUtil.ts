import { ref } from 'valtio'

import { ConstantsUtil } from '@reown/appkit-common'

import { ChainController } from '../controllers/ChainController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { EventsController } from '../controllers/EventsController.js'
import { RouterController } from '../controllers/RouterController.js'
import { SnackController } from '../controllers/SnackController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { StorageUtil } from './StorageUtil.js'
import type { SocialProvider } from './TypeUtil.js'

function getPopupWindow() {
  try {
    return CoreHelperUtil.returnOpenHref(
      `${ConstantsUtil.SECURE_SITE_SDK_ORIGIN}/loading`,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
  } catch (error) {
    throw new Error('Could not open social popup')
  }
}

export async function connectFarcaster() {
  RouterController.push('ConnectingFarcaster')
  const authConnector = ConnectorController.getAuthConnector()

  if (authConnector) {
    const accountData = ChainController.getAccountData()
    if (!accountData?.farcasterUrl) {
      try {
        const { url } = await authConnector.provider.getFarcasterUri()
        ChainController.setAccountProp('farcasterUrl', url, ChainController.state.activeChain)
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
    const timeout = setTimeout(() => {
      throw new Error('Social login timed out. Please try again.')
    }, 45_000)

    if (authConnector && socialProvider) {
      if (!CoreHelperUtil.isTelegram()) {
        popupWindow = getPopupWindow()
      }

      if (popupWindow) {
        ChainController.setAccountProp(
          'socialWindow',
          ref(popupWindow),
          ChainController.state.activeChain
        )
      } else if (!CoreHelperUtil.isTelegram()) {
        throw new Error('Could not create social popup')
      }

      const { uri } = await authConnector.provider.getSocialRedirectUri({
        provider: socialProvider
      })

      if (!uri) {
        popupWindow?.close()
        throw new Error('Could not fetch the social redirect uri')
      }

      if (popupWindow) {
        popupWindow.location.href = uri
      }

      if (CoreHelperUtil.isTelegram()) {
        StorageUtil.setTelegramSocialProvider(socialProvider)
        const parsedUri = CoreHelperUtil.formatTelegramSocialLoginUrl(uri)

        CoreHelperUtil.openHref(parsedUri, '_top')
      }

      clearTimeout(timeout)
    }
  } catch (error) {
    popupWindow?.close()
    SnackController.showError((error as Error)?.message)
  }
}

export async function executeSocialLogin(socialProvider: SocialProvider) {
  ChainController.setAccountProp(
    'socialProvider',
    socialProvider,
    ChainController.state.activeChain
  )
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
