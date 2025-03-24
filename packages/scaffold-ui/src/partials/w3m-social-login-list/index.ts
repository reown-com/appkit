import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ConnectorController,
  ConstantsUtil,
  OptionsController,
  RouterController,
  type SocialProvider
} from '@reown/appkit-controllers'
import { executeSocialLogin } from '@reown/appkit-controllers/utils'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-social'

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

  @state() private features = OptionsController.state.features

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
    let socials = this.features?.socials || []
    const isAuthConnectorExist = Boolean(this.authConnector)
    const isSocialsEnabled = socials?.length
    const isConnectSocialsView = RouterController.state.view === 'ConnectSocials'

    if ((!isAuthConnectorExist || !isSocialsEnabled) && !isConnectSocialsView) {
      return null
    }

    if (isConnectSocialsView && !isSocialsEnabled) {
      socials = ConstantsUtil.DEFAULT_FEATURES.socials
    }

    return html` <wui-flex flexDirection="column" gap="xs">
      ${socials.map(
        social =>
          html`<wui-list-social
            @click=${() => {
              this.onSocialClick(social)
            }}
            name=${social}
            logo=${social}
            tabIdx=${ifDefined(this.tabIdx)}
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-social-login-list': W3mSocialLoginList
  }
}
