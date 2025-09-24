/* eslint-disable max-depth */
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-loading-thumbnail'
import '@reown/appkit-ui/wui-logo'
import '@reown/appkit-ui/wui-text'
import { ErrorUtil } from '@reown/appkit-utils'

import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import styles from './styles.js'

@customElement('w3m-connecting-social-view')
export class W3mConnectingSocialView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private socialProvider = ChainController.getAccountData()?.socialProvider

  @state() private socialWindow = ChainController.getAccountData()?.socialWindow

  @state() protected error = false

  @state() protected connecting = false

  @state() protected message = 'Connect in the provider window'

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  private address = ChainController.getAccountData()?.address

  private connectionsByNamespace = ConnectionController.getConnections(
    ChainController.state.activeChain
  )

  private hasMultipleConnections = this.connectionsByNamespace.length > 0

  public authConnector = ConnectorController.getAuthConnector()

  public constructor() {
    super()
    const abortController = ErrorUtil.EmbeddedWalletAbortController

    abortController.signal.addEventListener('abort', () => {
      if (this.socialWindow) {
        this.socialWindow.close()
        ChainController.setAccountProp('socialWindow', undefined, ChainController.state.activeChain)
      }
    })
    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          if (val) {
            this.socialProvider = val.socialProvider
            if (val.socialWindow) {
              this.socialWindow = val.socialWindow
            }

            if (val.address) {
              const isMultiWalletEnabled = this.remoteFeatures?.multiWallet

              if (val.address !== this.address) {
                if (this.hasMultipleConnections && isMultiWalletEnabled) {
                  RouterController.replace('ProfileWallets')
                  SnackController.showSuccess('New Wallet Added')
                  this.address = val.address
                } else if (ModalController.state.open || OptionsController.state.enableEmbedded) {
                  ModalController.close()
                }
              }
            }
          }
        }),
        OptionsController.subscribeKey('remoteFeatures', val => {
          this.remoteFeatures = val
        })
      ]
    )
    if (this.authConnector) {
      this.connectSocial()
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    window.removeEventListener('message', this.handleSocialConnection, false)
    this.socialWindow?.close()
    ChainController.setAccountProp('socialWindow', undefined, ChainController.state.activeChain)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        data-error=${ifDefined(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${['10', '5', '5', '5'] as const}
        gap="6"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${ifDefined(this.socialProvider)}></wui-logo>
          ${this.error ? null : this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary"
            >Log in with
            <span class="capitalize">${this.socialProvider ?? 'Social'}</span></wui-text
          >
          <wui-text align="center" variant="lg-regular" color=${this.error ? 'error' : 'secondary'}
            >${this.message}</wui-text
          ></wui-flex
        >
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    return html`<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`
  }

  private handleSocialConnection = async (event: MessageEvent) => {
    if (event.data?.resultUri) {
      if (event.origin === ConstantsUtil.SECURE_SITE_ORIGIN) {
        window.removeEventListener('message', this.handleSocialConnection, false)
        try {
          if (this.authConnector && !this.connecting) {
            if (this.socialWindow) {
              this.socialWindow.close()
              ChainController.setAccountProp(
                'socialWindow',
                undefined,
                ChainController.state.activeChain
              )
            }
            this.connecting = true
            this.updateMessage()
            const uri = event.data.resultUri as string

            if (this.socialProvider) {
              EventsController.sendEvent({
                type: 'track',
                event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
                properties: { provider: this.socialProvider }
              })
            }
            await ConnectionController.connectExternal(
              {
                id: this.authConnector.id,
                type: this.authConnector.type,
                socialUri: uri
              },
              this.authConnector.chain
            )

            if (this.socialProvider) {
              StorageUtil.setConnectedSocialProvider(this.socialProvider)

              EventsController.sendEvent({
                type: 'track',
                event: 'SOCIAL_LOGIN_SUCCESS',
                properties: { provider: this.socialProvider }
              })
            }
          }
        } catch (error) {
          this.error = true
          this.updateMessage()
          if (this.socialProvider) {
            EventsController.sendEvent({
              type: 'track',
              event: 'SOCIAL_LOGIN_ERROR',
              properties: {
                provider: this.socialProvider,
                message: CoreHelperUtil.parseError(error)
              }
            })
          }
        }
      } else {
        RouterController.goBack()
        SnackController.showError('Untrusted Origin')
        if (this.socialProvider) {
          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_ERROR',
            properties: {
              provider: this.socialProvider,
              message: 'Untrusted Origin'
            }
          })
        }
      }
    }
  }

  private connectSocial() {
    const interval = setInterval(() => {
      if (this.socialWindow?.closed) {
        if (!this.connecting && RouterController.state.view === 'ConnectingSocial') {
          if (this.socialProvider) {
            EventsController.sendEvent({
              type: 'track',
              event: 'SOCIAL_LOGIN_CANCELED',
              properties: { provider: this.socialProvider }
            })
          }
          RouterController.goBack()
        }
        clearInterval(interval)
      }
    }, 1000)
    window.addEventListener('message', this.handleSocialConnection, false)
  }

  private updateMessage() {
    if (this.error) {
      this.message = 'Something went wrong'
    } else if (this.connecting) {
      this.message = 'Retrieving user data'
    } else {
      this.message = 'Connect in the provider window'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-social-view': W3mConnectingSocialView
  }
}
