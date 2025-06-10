import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AlertController,
  ChainController,
  ConnectorController,
  OptionsController,
  RouterController,
  type SocialProvider
} from '@reown/appkit-controllers'
import { executeSocialLogin } from '@reown/appkit-controllers/utils'
import { CoreHelperUtil } from '@reown/appkit-controllers/utils'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-social'
import '@reown/appkit-ui/wui-logo-select'
import { W3mFrameProvider } from '@reown/appkit-wallet'

import styles from './styles.js'

@customElement('w3m-social-login-widget')
export class W3mSocialLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

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

    if (!isAuthConnectorExist || !isSocialsEnabled) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" gap="xs" data-testid="w3m-social-login-widget">
        ${socials.slice(0, 2).map(
          social =>
            html`<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              logo=${social}
              tabIdx=${ifDefined(this.tabIdx)}
              ?disabled=${this.isPwaLoading}
            ></wui-logo-select>`
        )}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  onMoreSocialsClick() {
    RouterController.push('ConnectSocials')
  }

  async onSocialClick(socialProvider?: SocialProvider) {
    const isAvailableChain = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(
      chain => chain === ChainController.state.activeChain
    )

    if (!isAvailableChain) {
      /**
       * If we are trying to call this function when active network is nut supported by auth connector, we should switch to the first available network
       * This will redirect us to SwitchNetwork screen and back to the current screen again
       */
      const caipNetwork = ChainController.getFirstCaipNetworkSupportsAuthConnector()

      if (caipNetwork) {
        RouterController.push('SwitchNetwork', { network: caipNetwork })

        return
      }
    }

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
    'w3m-social-login-widget': W3mSocialLoginWidget
  }
}
