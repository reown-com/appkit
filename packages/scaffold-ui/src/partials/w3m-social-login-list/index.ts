import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import {
  AlertController,
  ConnectorController,
  ConstantsUtil,
  OptionsController,
  RouterController,
  type SocialProvider
} from '@reown/appkit-controllers'
import { executeSocialLogin } from '@reown/appkit-controllers/utils'
import { CoreHelperUtil } from '@reown/appkit-controllers/utils'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-social'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import styles from './styles.js'

@customElement('w3m-social-login-list')
export class W3mSocialLoginList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  @state() private isPwaLoading = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.authConnector = this.connectors.find(c => c.type === 'AUTH')
      }),
      OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val))
    )
  }

  public override connectedCallback() {
    super.connectedCallback()
    this.handlePwaFrameLoad()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    let socials = this.remoteFeatures?.socials || []
    const isAuthConnectorExist = Boolean(this.authConnector)
    const isSocialsEnabled = socials?.length
    const isConnectSocialsView = RouterController.state.view === 'ConnectSocials'

    if ((!isAuthConnectorExist || !isSocialsEnabled) && !isConnectSocialsView) {
      return null
    }

    if (isConnectSocialsView && !isSocialsEnabled) {
      socials = ConstantsUtil.DEFAULT_SOCIALS
    }

    return html` <wui-flex flexDirection="column" gap="xs">
      ${socials.map(
        social =>
          html`<wui-list-social
            @click=${() => {
              this.onSocialClick(social)
            }}
            data-testid=${`social-selector-${social}`}
            name=${social}
            logo=${social}
            ?disabled=${this.isPwaLoading}
          ></wui-list-social>`
      )}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  async onSocialClick(socialProvider?: SocialProvider) {
    if (socialProvider) {
      await executeSocialLogin(socialProvider)
    }
  }

  private async handlePwaFrameLoad() {
    if (CoreHelperUtil.isPWA()) {
      this.isPwaLoading = true
      try {
        if (this.authConnector?.provider instanceof W3mFrameProvider) {
          await this.authConnector.provider.init()
        }
      } catch (error) {
        AlertController.open(
          {
            shortMessage: 'Error loading embedded wallet in PWA',
            longMessage: (error as Error).message
          },
          'error'
        )
      } finally {
        this.isPwaLoading = false
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-social-login-list': W3mSocialLoginList
  }
}
