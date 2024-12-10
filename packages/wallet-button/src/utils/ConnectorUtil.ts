/* eslint-disable max-depth */
import {
  AccountController,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  StorageUtil,
  type Connector,
  RouterController,
  type WcWallet
} from '@reown/appkit-core'
import { SocialProviderEnum } from '@reown/appkit-utils'
import type { SocialProvider } from './TypeUtil.js'
import { ConstantsUtil } from './ConstantsUtil.js'
import { ParseUtil, type ParsedCaipAddress } from '@reown/appkit-common'

interface ConnectWalletConnect {
  walletConnect: boolean
  wallet?: WcWallet
  connector?: Connector
}

export const ConnectorUtil = {
  connectWalletConnect({
    walletConnect,
    wallet,
    connector
  }: ConnectWalletConnect): Promise<ParsedCaipAddress> {
    return new Promise((resolve, reject) => {
      if (walletConnect) {
        ChainController.setActiveConnector(connector)
      }

      ModalController.open({ view: 'ConnectingWalletConnect' })
      RouterController.push('ConnectingWalletConnect', { wallet })

      const unsubscribeModalController = ModalController.subscribeKey('open', val => {
        if (!val) {
          if (RouterController.state.view !== 'Connect') {
            RouterController.push('Connect')
          }
          unsubscribeModalController()
          reject(new Error('Modal closed'))
        }
      })

      const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          ModalController.close()
          unsubscribeChainController()
          resolve(ParseUtil.parseCaipAddress(val))
        }
      })
    })
  },
  connectExternal(connector: Connector): Promise<ParsedCaipAddress> {
    return new Promise((resolve, reject) => {
      const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          ModalController.close()
          unsubscribeChainController()
          resolve(ParseUtil.parseCaipAddress(val))
        }
      })

      ConnectionController.connectExternal(connector, connector.chain).catch(() => {
        unsubscribeChainController()
        reject(new Error('Connection rejected'))
      })
    })
  },
  connectSocial(social: SocialProvider): Promise<ParsedCaipAddress> {
    let socialWindow: Window | null | undefined = AccountController.state.socialWindow
    let socialProvider = AccountController.state.socialProvider
    let connectingSocial = false
    let popupWindow: Window | null = null

    const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
      if (val) {
        ModalController.close()
        unsubscribeChainController()
      }
    })

    return new Promise((resolve, reject) => {
      async function handleSocialConnection(event: MessageEvent) {
        if (event.data?.resultUri) {
          if (event.origin === ConstantsUtil.SECURE_SITE_ORIGIN) {
            window.removeEventListener('message', handleSocialConnection, false)
            try {
              const authConnector = ConnectorController.getAuthConnector()

              if (authConnector && !connectingSocial) {
                if (socialWindow) {
                  socialWindow.close()
                  AccountController.setSocialWindow(undefined, ChainController.state.activeChain)
                  socialWindow = AccountController.state.socialWindow
                }
                connectingSocial = true
                const uri = event.data.resultUri as string

                if (socialProvider) {
                  EventsController.sendEvent({
                    type: 'track',
                    event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
                    properties: { provider: socialProvider }
                  })
                }
                await authConnector.provider.connectSocial(uri)

                if (socialProvider) {
                  StorageUtil.setConnectedSocialProvider(socialProvider)
                  await ConnectionController.connectExternal(authConnector, authConnector.chain)

                  const caipAddress = ChainController.state.activeCaipAddress

                  if (!caipAddress) {
                    reject(new Error('Failed to connect'))

                    return
                  }

                  resolve(ParseUtil.parseCaipAddress(caipAddress))

                  EventsController.sendEvent({
                    type: 'track',
                    event: 'SOCIAL_LOGIN_SUCCESS',
                    properties: { provider: socialProvider }
                  })
                }
              }
            } catch (err) {
              reject(new Error('Failed to connect'))
              if (socialProvider) {
                EventsController.sendEvent({
                  type: 'track',
                  event: 'SOCIAL_LOGIN_ERROR',
                  properties: { provider: socialProvider }
                })
              }
            }
          } else if (socialProvider) {
            EventsController.sendEvent({
              type: 'track',
              event: 'SOCIAL_LOGIN_ERROR',
              properties: { provider: socialProvider }
            })
          }
        }
      }

      async function connectSocial() {
        if (social) {
          AccountController.setSocialProvider(social, ChainController.state.activeChain)
          socialProvider = AccountController.state.socialProvider
          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_STARTED',
            properties: { provider: socialProvider as SocialProvider }
          })
        }

        if (socialProvider === SocialProviderEnum.Farcaster) {
          ModalController.open({ view: 'ConnectingFarcaster' })

          const unsubscribeModalController = ModalController.subscribeKey('open', val => {
            if (!val && social === 'farcaster') {
              reject(new Error('Popup closed'))
              RouterController.push('Connect')
              unsubscribeModalController()
            }
          })

          const authConnector = ConnectorController.getAuthConnector()

          if (authConnector) {
            if (!AccountController.state.farcasterUrl) {
              try {
                const { url } = await authConnector.provider.getFarcasterUri()

                AccountController.setFarcasterUrl(url, ChainController.state.activeChain)
              } catch {
                reject(new Error('Failed to connect to farcaster'))
              }
            }
          }
        } else {
          const authConnector = ConnectorController.getAuthConnector()
          popupWindow = CoreHelperUtil.returnOpenHref(
            '',
            'popupWindow',
            'width=600,height=800,scrollbars=yes'
          )

          try {
            if (authConnector && socialProvider) {
              const { uri } = await authConnector.provider.getSocialRedirectUri({
                provider: socialProvider
              })

              if (popupWindow && uri) {
                AccountController.setSocialWindow(popupWindow, ChainController.state.activeChain)
                socialWindow = AccountController.state.socialWindow
                popupWindow.location.href = uri

                const interval = setInterval(() => {
                  if (socialWindow?.closed && !connectingSocial) {
                    reject(new Error('Popup closed'))
                    clearInterval(interval)
                  }
                }, 1000)

                window.addEventListener('message', handleSocialConnection, false)
              } else {
                popupWindow?.close()
                reject(new Error('Failed to initiate social connection'))
              }
            }
          } catch {
            reject(new Error('Failed to initiate social connection'))
            popupWindow?.close()
          }
        }
      }

      connectSocial()
    })
  }
}
