/* eslint-disable max-depth */
import { type ChainNamespace, ParseUtil, type ParsedCaipAddress } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { AccountController } from '../controllers/AccountController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { EventsController } from '../controllers/EventsController.js'
import { ModalController } from '../controllers/ModalController.js'
import { RouterController, type RouterControllerState } from '../controllers/RouterController.js'
import { getPreferredAccountType } from './ChainControllerUtil.js'
import { ConstantsUtil } from './ConstantsUtil.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { StorageUtil } from './StorageUtil.js'
import type { Connector, SocialProvider } from './TypeUtil.js'

// -- Constants ------------------------------------------ //
const UPDATE_EMAIL_INTERVAL_MS = 1_000

interface ConnectWalletConnectParameters {
  walletConnect: boolean
  connector?: Connector
  closeModalOnConnect?: boolean
  redirectViewOnModalClose?: RouterControllerState['view']
  onOpen?: (isMobile?: boolean) => void
  onConnect?: () => void
}

interface ConnectSocialParameters {
  social: SocialProvider
  closeModalOnConnect?: boolean
  redirectViewOnModalClose?: RouterControllerState['view']
  onOpenFarcaster?: () => void
  onConnect?: () => void
}

interface ConnectEmailParameters {
  closeModalOnConnect?: boolean
  redirectViewOnModalClose?: RouterControllerState['view']
  onOpen?: () => void
  onConnect?: () => void
}

export const ConnectorControllerUtil = {
  checkNamespaceConnectorId(namespace: ChainNamespace, connectorId: string): boolean {
    return ConnectorController.getConnectorId(namespace) === connectorId
  },
  isSocialProvider(socialProvider: string): socialProvider is SocialProvider {
    return ConstantsUtil.DEFAULT_REMOTE_FEATURES.socials.includes(socialProvider as SocialProvider)
  },
  connectWalletConnect({
    walletConnect,
    connector,
    closeModalOnConnect = true,
    redirectViewOnModalClose = 'Connect',
    onOpen,
    onConnect
  }: ConnectWalletConnectParameters): Promise<ParsedCaipAddress> {
    return new Promise((resolve, reject) => {
      if (walletConnect) {
        ConnectorController.setActiveConnector(connector)
      }

      onOpen?.(CoreHelperUtil.isMobile() && walletConnect)

      if (redirectViewOnModalClose) {
        const unsubscribeModalController = ModalController.subscribeKey('open', val => {
          if (!val) {
            if (RouterController.state.view !== redirectViewOnModalClose) {
              RouterController.replace(redirectViewOnModalClose)
            }
            unsubscribeModalController()
            reject(new Error('Modal closed'))
          }
        })
      }

      const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          onConnect?.()
          if (closeModalOnConnect) {
            ModalController.close()
          }
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
  connectSocial({
    social,
    closeModalOnConnect = true,
    onOpenFarcaster,
    onConnect
  }: ConnectSocialParameters): Promise<ParsedCaipAddress> {
    let socialWindow: Window | null | undefined = AccountController.state.socialWindow
    let socialProvider = AccountController.state.socialProvider
    let connectingSocial = false
    let popupWindow: Window | null = null

    const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
      if (val) {
        if (closeModalOnConnect) {
          ModalController.close()
        }
        unsubscribeChainController()
      }
    })

    return new Promise((resolve, reject) => {
      async function handleSocialConnection(event: MessageEvent) {
        if (event.data?.resultUri) {
          if (event.origin === CommonConstantsUtil.SECURE_SITE_SDK_ORIGIN) {
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
                const network = ChainController.state.activeCaipNetwork
                await authConnector.provider.connectSocial({
                  uri,
                  chainId: network?.caipNetworkId
                })

                if (socialProvider) {
                  StorageUtil.setConnectedSocialProvider(socialProvider)
                  await ConnectionController.connectExternal(
                    {
                      id: authConnector.id,
                      type: authConnector.type,
                      socialUri: uri
                    },
                    authConnector.chain
                  )

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
              if (socialProvider) {
                EventsController.sendEvent({
                  type: 'track',
                  event: 'SOCIAL_LOGIN_ERROR',
                  properties: { provider: socialProvider }
                })
              }
              reject(new Error('Failed to connect'))
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

        if (socialProvider === 'farcaster') {
          onOpenFarcaster?.()
          const unsubscribeModalController = ModalController.subscribeKey('open', val => {
            if (!val && social === 'farcaster') {
              reject(new Error('Popup closed'))
              onConnect?.()
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
            `${CommonConstantsUtil.SECURE_SITE_SDK_ORIGIN}/loading`,
            'popupWindow',
            'width=600,height=800,scrollbars=yes'
          )

          try {
            if (authConnector && socialProvider) {
              const { uri } = await authConnector.provider.getSocialRedirectUri({
                provider:
                  socialProvider as W3mFrameTypes.Requests['AppGetSocialRedirectUriRequest']['provider']
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
  },
  connectEmail({
    closeModalOnConnect = true,
    redirectViewOnModalClose = 'Connect',
    onOpen,
    onConnect
  }: ConnectEmailParameters): Promise<ParsedCaipAddress> {
    return new Promise((resolve, reject) => {
      onOpen?.()

      if (redirectViewOnModalClose) {
        const unsubscribeModalController = ModalController.subscribeKey('open', val => {
          if (!val) {
            if (RouterController.state.view !== redirectViewOnModalClose) {
              RouterController.replace(redirectViewOnModalClose)
            }
            unsubscribeModalController()
            reject(new Error('Modal closed'))
          }
        })
      }

      const unsubscribeChainController = ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          onConnect?.()
          if (closeModalOnConnect) {
            ModalController.close()
          }
          unsubscribeChainController()
          resolve(ParseUtil.parseCaipAddress(val))
        }
      })
    })
  },
  async updateEmail(): Promise<{ email: string }> {
    const connectorId = StorageUtil.getConnectedConnectorId(ChainController.state.activeChain)
    const authConnector = ConnectorController.getAuthConnector()

    if (!authConnector) {
      throw new Error('No auth connector found')
    }

    if (connectorId !== CommonConstantsUtil.CONNECTOR_ID.AUTH) {
      throw new Error('Not connected to email or social')
    }

    const initialEmail = authConnector.provider.getEmail() ?? ''

    RouterController.push('UpdateEmailWallet', {
      email: initialEmail,
      redirectView: undefined
    })

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const newEmail = authConnector.provider.getEmail() ?? ''

        if (newEmail !== initialEmail) {
          ModalController.close()
          clearInterval(interval)
          unsubscribeModalController()
          resolve({ email: newEmail })
        }
      }, UPDATE_EMAIL_INTERVAL_MS)

      const unsubscribeModalController = ModalController.subscribeKey('open', val => {
        if (!val) {
          if (RouterController.state.view !== 'Connect') {
            RouterController.push('Connect')
          }
          clearInterval(interval)
          unsubscribeModalController()
          reject(new Error('Modal closed'))
        }
      })
    })
  },
  canSwitchToSmartAccount(namespace: ChainNamespace) {
    const isSmartAccountEnabled = ChainController.checkIfSmartAccountEnabled()

    return (
      isSmartAccountEnabled &&
      getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
    )
  }
}
