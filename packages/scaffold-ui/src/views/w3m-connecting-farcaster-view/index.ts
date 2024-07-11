import {
  AccountController,
  ConnectionController,
  ConnectorController,
  ModalController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-connecting-farcaster-view')
export class W3mConnectingFarcasterView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  protected timeout?: ReturnType<typeof setTimeout> = undefined

  @state() private socialProvider = AccountController.state.socialProvider

  @state() protected uri = AccountController.state.farcasterUrl

  @state() protected ready = false

  public authConnector = ConnectorController.getAuthConnector()

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.farcasterUrl) {
            this.uri = val.farcasterUrl
          }
          if (val.socialProvider) {
            this.socialProvider = val.socialProvider
          }
        })
      ]
    )

    if (this.authConnector) {
      this.connectFarcaster()
    }

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

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', 'xl', 'xl', 'xl']}
        gap="xl"
      >
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async connectFarcaster() {
    if (this.authConnector) {
      try {
        await this.authConnector?.provider.connectFarcaster()
        if (this.socialProvider) {
          StorageUtil.setConnectedSocialProvider(this.socialProvider)
        }
        SnackController.showLoading('Loading user data')
        await ConnectionController.connectExternal(this.authConnector)
        ModalController.close()
      } catch (error) {
        RouterController.goBack()
        SnackController.showError(error)
      }
    }
  }

  private onRenderProxy() {
    if (!this.ready && this.uri) {
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
      ?arenaClear=${true}
      data-testid="wui-qr-code"
    ></wui-qr-code>`
  }

  private forceUpdate = () => {
    this.requestUpdate()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-farcaster-view': W3mConnectingFarcasterView
  }
}
