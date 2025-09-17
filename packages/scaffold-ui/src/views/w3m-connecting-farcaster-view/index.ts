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
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-loading-thumbnail'
import '@reown/appkit-ui/wui-logo'
import '@reown/appkit-ui/wui-qr-code'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-connecting-farcaster-view')
export class W3mConnectingFarcasterView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  protected timeout?: ReturnType<typeof setTimeout> = undefined

  @state() private socialProvider = ChainController.getAccountData()?.socialProvider

  @state() protected uri = ChainController.getAccountData()?.farcasterUrl

  @state() protected ready = false

  @state() protected loading = false

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public authConnector = ConnectorController.getAuthConnector()

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          this.socialProvider = val?.socialProvider
          this.uri = val?.farcasterUrl
          this.connectFarcaster()
        }),
        OptionsController.subscribeKey('remoteFeatures', val => {
          this.remoteFeatures = val
        })
      ]
    )

    window.addEventListener('resize', this.forceUpdate)
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this.timeout)
    window.removeEventListener('resize', this.forceUpdate)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onRenderProxy()

    return html`${this.platformTemplate()}`
  }

  // -- Private ------------------------------------------- //
  private platformTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return html`${this.mobileTemplate()}`
    }

    return html`${this.desktopTemplate()}`
  }

  private desktopTemplate() {
    if (this.loading) {
      return html`${this.loadingTemplate()}`
    }

    return html`${this.qrTemplate()}`
  }

  private qrTemplate() {
    return html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${['0', '5', '5', '5']}
      gap="5"
    >
      <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

      <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
      ${this.copyTemplate()}
    </wui-flex>`
  }

  private loadingTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['5', '5', '5', '5'] as const}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo="farcaster"></wui-logo>
          ${this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="md-medium" color="primary">
            Loading user data
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Please wait a moment while we load your data.
          </wui-text>
        </wui-flex>
      </wui-flex>
    `
  }

  private mobileTemplate() {
    return html` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${['10', '5', '5', '5'] as const}
      gap="5"
    >
      <wui-flex justifyContent="center" alignItems="center">
        <wui-logo logo="farcaster"></wui-logo>
        ${this.loaderTemplate()}
        <wui-icon-box
          color="error"
          icon="close"
          size="sm"
        ></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="md-medium" color="primary"
          >Continue in Farcaster</span></wui-text
        >
        <wui-text align="center" variant="sm-regular" color="secondary"
          >Accept connection request in the app</wui-text
        ></wui-flex
      >
      ${this.mobileLinkTemplate()}
    </wui-flex>`
  }

  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    return html`<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`
  }

  private async connectFarcaster() {
    if (this.authConnector) {
      try {
        await this.authConnector?.provider.connectFarcaster()

        if (this.socialProvider) {
          StorageUtil.setConnectedSocialProvider(this.socialProvider)

          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
            properties: { provider: this.socialProvider }
          })
        }
        this.loading = true
        const connectionsByNamespace = ConnectionController.getConnections(this.authConnector.chain)
        const hasConnections = connectionsByNamespace.length > 0
        await ConnectionController.connectExternal(this.authConnector, this.authConnector.chain)
        const isMultiWalletEnabled = this.remoteFeatures?.multiWallet
        if (this.socialProvider) {
          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_SUCCESS',
            properties: { provider: this.socialProvider }
          })
        }
        this.loading = false
        if (hasConnections && isMultiWalletEnabled) {
          RouterController.replace('ProfileWallets')
          SnackController.showSuccess('New Wallet Added')
        } else {
          ModalController.close()
        }
      } catch (error) {
        if (this.socialProvider) {
          EventsController.sendEvent({
            type: 'track',
            event: 'SOCIAL_LOGIN_ERROR',
            properties: { provider: this.socialProvider, message: CoreHelperUtil.parseError(error) }
          })
        }
        RouterController.goBack()
        SnackController.showError(error)
      }
    }
  }

  private mobileLinkTemplate() {
    return html`<wui-button
      size="md"
      ?loading=${this.loading}
      ?disabled=${!this.uri || this.loading}
      @click=${() => {
        if (this.uri) {
          CoreHelperUtil.openHref(this.uri, '_blank')
        }
      }}
    >
      Open farcaster</wui-button
    >`
  }

  private onRenderProxy() {
    if (!this.ready && this.uri) {
      // This setTimeout needed to avoid the beginning of the animation from not starting to resize immediately and some weird svg errors
      this.timeout = setTimeout(() => {
        this.ready = true
      }, 200)
    }
  }

  private qrCodeTemplate() {
    if (!this.uri || !this.ready) {
      return null
    }

    const size = this.getBoundingClientRect().width - 40

    return html` <wui-qr-code
      size=${size}
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      ?farcaster=${true}
      data-testid="wui-qr-code"
      color=${ifDefined(ThemeController.state.themeVariables['--w3m-qr-color'])}
    ></wui-qr-code>`
  }

  private copyTemplate() {
    const inactive = !this.uri || !this.ready

    return html`<wui-button
      .disabled=${inactive}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="sm" color="default" slot="iconRight" name="copy"></wui-icon>
      Copy link
    </wui-button>`
  }

  private forceUpdate = () => {
    this.requestUpdate()
  }

  // -- Protected ----------------------------------------- //
  protected onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Link copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-farcaster-view': W3mConnectingFarcasterView
  }
}
