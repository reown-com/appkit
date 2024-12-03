/* eslint-disable max-depth */
import {
  AccountController,
  ChainController,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'

@customElement('w3m-connecting-social-view')
export class W3mConnectingSocialView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private socialProvider = AccountController.state.socialProvider

  @state() private socialWindow = AccountController.state.socialWindow

  @state() protected error = false

  @state() protected connecting = false

  @state() protected message = 'Connect in the provider window'

  public authConnector = ConnectorController.getAuthConnector()

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.socialProvider) {
            this.socialProvider = val.socialProvider
          }
          if (val.socialWindow) {
            this.socialWindow = val.socialWindow
          }
          if (val.address) {
            if (ModalController.state.open) {
              ModalController.close()
            }
          }
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
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        data-error=${ifDefined(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', 'xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${ifDefined(this.socialProvider)}></wui-logo>
          ${this.error ? null : this.loaderTemplate()}
          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text align="center" variant="paragraph-500" color="fg-100"
            >Log in with
            <span class="capitalize">${this.socialProvider ?? 'Social'}</span></wui-text
          >
          <wui-text align="center" variant="small-400" color=${this.error ? 'error-100' : 'fg-200'}
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
              AccountController.setSocialWindow(undefined, ChainController.state.activeChain)
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
            await this.authConnector.provider.connectSocial(uri)

            if (this.socialProvider) {
              StorageUtil.setConnectedSocialProvider(this.socialProvider)
              await ConnectionController.connectExternal(
                this.authConnector,
                this.authConnector.chain
              )
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
              properties: { provider: this.socialProvider }
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
            properties: { provider: this.socialProvider }
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
