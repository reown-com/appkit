import {
  AccountController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type SocialProvider
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import styles from './styles.js'
import { ifDefined } from 'lit/directives/if-defined.js'

const MAX_TOP_VIEW = 2
const MAXIMUM_LENGTH = 6

@customElement('w3m-social-login-widget')
export class W3mSocialLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private desktopWindow?: Window | null

  private mobileWindow?: Window | null

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  private connector = this.connectors.find(c => c.type === 'AUTH')

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.connector = this.connectors.find(c => c.type === 'AUTH')
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.connector?.socials) {
      return null
    }

    return html`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="xs"
        .padding=${['0', '0', 'xs', '0'] as const}
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
      ${this.separatorTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private topViewTemplate() {
    if (!this.connector?.socials) {
      return null
    }

    if (this.connector.socials.length === 2) {
      return html` <wui-flex gap="xs">
        ${this.connector.socials.slice(0, MAX_TOP_VIEW).map(
          social =>
            html`<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              logo=${social}
            ></wui-logo-select>`
        )}
      </wui-flex>`
    }

    return html` <wui-list-social
      data-testid=${`social-selector-${this.connector?.socials?.[0]}`}
      @click=${() => {
        this.onSocialClick(this.connector?.socials?.[0])
      }}
      logo=${ifDefined(this.connector.socials[0])}
      align="center"
      name=${`Continue with ${this.connector.socials[0]}`}
    ></wui-list-social>`
  }

  private bottomViewTemplate() {
    if (!this.connector?.socials) {
      return null
    }

    if (this.connector?.socials.length <= MAX_TOP_VIEW) {
      return null
    }

    if (this.connector?.socials.length > MAXIMUM_LENGTH) {
      return html`<wui-flex gap="xs">
        ${this.connector.socials.slice(1, MAXIMUM_LENGTH - 1).map(
          social =>
            html`<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              logo=${social}
            ></wui-logo-select>`
        )}
        <wui-logo-select logo="more" @click=${this.onMoreSocialsClick.bind(this)}></wui-logo-select>
      </wui-flex>`
    }

    return html`<wui-flex gap="xs">
      ${this.connector.socials.slice(1, this.connector.socials.length).map(
        social =>
          html`<wui-logo-select
            data-testid=${`social-selector-${social}`}
            @click=${() => {
              this.onSocialClick(social)
            }}
            logo=${social}
          ></wui-logo-select>`
      )}
    </wui-flex>`
  }

  private separatorTemplate() {
    const walletConnectConnector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
    if (walletConnectConnector) {
      return html`<wui-separator text="or"></wui-separator>`
    }

    return null
  }

  // -- Private Methods ----------------------------------- //
  onMoreSocialsClick() {
    RouterController.push('ConnectSocials')
  }

  async onSocialClick(socialProvider?: SocialProvider) {
    if (socialProvider) {
      AccountController.setSocialProvider(socialProvider)
      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_STARTED',
        properties: { provider: socialProvider }
      })
      RouterController.push('ConnectingSocial')
    }
    const authConnector = ConnectorController.getAuthConnector()
    if (CoreHelperUtil.isMobile()) {
      this.mobileWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'width=600,height=800,scrollbars=yes'
      )
    }

    try {
      if (authConnector && socialProvider) {
        const { uri } = await authConnector.provider.getSocialRedirectUri({
          provider: socialProvider
        })

        if (!CoreHelperUtil.isMobile()) {
          this.desktopWindow = CoreHelperUtil.returnOpenHref(
            uri,
            'popupWindow',
            'width=600,height=800,scrollbars=yes'
          )
        }
        if (this.desktopWindow && uri) {
          AccountController.setSocialWindow(this.desktopWindow)
        } else if (this.mobileWindow && uri) {
          this.mobileWindow.location.href = uri
          AccountController.setSocialWindow(this.mobileWindow)
        } else {
          throw new Error('Something went wrong')
        }
      }
    } catch (error) {
      SnackController.showError('Something went wrong')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-social-login-widget': W3mSocialLoginWidget
  }
}
