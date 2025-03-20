import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  ConstantsUtil,
  OptionsController,
  RouterController,
  type SocialProvider,
  type WalletGuideType
} from '@reown/appkit-controllers'
import { executeSocialLogin } from '@reown/appkit-controllers/utils'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-social'
import '@reown/appkit-ui/wui-logo-select'

import styles from './styles.js'

const MAX_TOP_VIEW = 2
const MAXIMUM_LENGTH = 6

@customElement('w3m-social-login-widget')
export class W3mSocialLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public walletGuide: WalletGuideType = 'get-started'

  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private features = OptionsController.state.features

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.authConnector = this.connectors.find(c => c.type === 'AUTH')
      }),
      OptionsController.subscribeKey('features', val => (this.features = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="xs"
        data-testid="w3m-social-login-widget"
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private topViewTemplate() {
    const isCreateWalletPage = this.walletGuide === 'explore'
    let socials = this.features?.socials

    if (!socials && isCreateWalletPage) {
      socials = ConstantsUtil.DEFAULT_FEATURES.socials

      return this.renderTopViewContent(socials)
    }

    if (!socials) {
      return null
    }

    return this.renderTopViewContent(socials)
  }

  private renderTopViewContent(socials: SocialProvider[]) {
    if (socials.length === 2) {
      return html` <wui-flex gap="xs">
        ${socials.slice(0, MAX_TOP_VIEW).map(
          social =>
            html`<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              logo=${social}
              tabIdx=${ifDefined(this.tabIdx)}
            ></wui-logo-select>`
        )}
      </wui-flex>`
    }

    return html` <wui-list-social
      data-testid=${`social-selector-${socials[0]}`}
      @click=${() => {
        this.onSocialClick(socials[0])
      }}
      logo=${ifDefined(socials[0])}
      align="center"
      name=${`Continue with ${socials[0]}`}
      tabIdx=${ifDefined(this.tabIdx)}
    ></wui-list-social>`
  }

  private bottomViewTemplate() {
    let socials = this.features?.socials
    const isCreateWalletPage = this.walletGuide === 'explore'
    const isSocialDisabled = !this.authConnector || !socials || !socials?.length

    if (isSocialDisabled && isCreateWalletPage) {
      socials = ConstantsUtil.DEFAULT_FEATURES.socials
    }

    if (!socials) {
      return null
    }

    if (socials.length <= MAX_TOP_VIEW) {
      return null
    }

    if (socials && socials.length > MAXIMUM_LENGTH) {
      return html`<wui-flex gap="xs">
        ${socials.slice(1, MAXIMUM_LENGTH - 1).map(
          social =>
            html`<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              logo=${social}
              tabIdx=${ifDefined(this.tabIdx)}
            ></wui-logo-select>`
        )}
        <wui-logo-select
          logo="more"
          tabIdx=${ifDefined(this.tabIdx)}
          @click=${this.onMoreSocialsClick.bind(this)}
        ></wui-logo-select>
      </wui-flex>`
    }

    if (!socials) {
      return null
    }

    return html`<wui-flex gap="xs">
      ${socials.slice(1, socials.length).map(
        social =>
          html`<wui-logo-select
            data-testid=${`social-selector-${social}`}
            @click=${() => {
              this.onSocialClick(social)
            }}
            logo=${social}
            tabIdx=${ifDefined(this.tabIdx)}
          ></wui-logo-select>`
      )}
    </wui-flex>`
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-social-login-widget': W3mSocialLoginWidget
  }
}
