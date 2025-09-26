/* eslint-disable max-depth */
import { ref } from 'valtio'

import { type ChainNamespace, ParseUtil, type ParsedCaipAddress } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

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
  namespace?: ChainNamespace
  closeModalOnConnect?: boolean
  redirectViewOnModalClose?: RouterControllerState['view']
  onOpenFarcaster?: () => void
  onConnect?: () => void
}

interface ConnectEmailParameters {
  closeModalOnConnect?: boolean
  namespace?: ChainNamespace
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
    namespace,
    closeModalOnConnect = true,
    onOpenFarcaster,
    onConnect
  }: ConnectSocialParameters): Promise<ParsedCaipAddress> {
    const accountData = ChainController.getAccountData(namespace)
    let socialWindow: Window | null | undefined = accountData?.socialWindow
    let socialProvider = accountData?.socialProvider
    let isConnectingSocial = false
    let popupWindow: Window | null = null

    const namespaceToUse = namespace || ChainController.state.activeChain

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
              const authConnector = ConnectorController.getAuthConnector(namespaceToUse)

              if (authConnector && !isConnectingSocial) {
                const _accountData = ChainController.getAccountData(namespaceToUse)
                if (socialWindow) {
                  socialWindow.close()
                  ChainController.setAccountProp('socialWindow', undefined, namespaceToUse)
                  socialWindow = _accountData?.socialWindow
                }
                isConnectingSocial = true
                const uri = event.data.resultUri as string

                if (socialProvider) {
                  EventsController.sendEvent({
                    type: 'track',
                    event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
                    properties: { provider: socialProvider }
                  })
                }

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
                  properties: { provider: socialProvider, message: CoreHelperUtil.parseError(err) }
                })
              }
              reject(new Error('Failed to connect'))
            }
          } else if (socialProvider) {
            EventsController.sendEvent({
              type: 'track',
              event: 'SOCIAL_LOGIN_ERROR',
              properties: { provider: socialProvider, message: 'Untrusted Origin' }
            })
          }
        }
      }

      async function connectSocial() {
        if (social) {
          const _accountData = ChainController.getAccountData(namespaceToUse)
          ChainController.setAccountProp('socialProvider', social, namespaceToUse)
          socialProvider = _accountData?.socialProvider
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
            const _accountData = ChainController.getAccountData(namespaceToUse)
            if (!_accountData?.farcasterUrl) {
              try {
                const { url } = await authConnector.provider.getFarcasterUri()

                ChainController.setAccountProp('farcasterUrl', url, namespaceToUse)
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
                ChainController.setAccountProp('socialWindow', ref(popupWindow), namespaceToUse)
                socialWindow = accountData?.socialWindow
                popupWindow.location.href = uri

                const interval = setInterval(() => {
                  if (socialWindow?.closed && !isConnectingSocial) {
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

    await ModalController.open({
      view: 'UpdateEmailWallet',
      data: {
        email: initialEmail,
        redirectView: undefined
      }
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
