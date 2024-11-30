import {
  AccountController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController,
  type FeaturesSocials,
  type SocialProvider,
  type WalletGuideType
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import styles from './styles.js'
import { SocialProviderEnum } from '@reown/appkit-utils'

const MAX_VIEW = 3

@customElement('w3m-social-login-widget')
export class W3mSocialLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private popupWindow?: Window | null

  // -- State & Properties -------------------------------- //
  @property() public walletGuide: WalletGuideType = 'get-started'

  @property() public socials: FeaturesSocials[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="xs"
        .padding=${['0', '0', 'xs', '0'] as const}
        data-testid="w3m-social-login-widget"
      >
        ${this.viewTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private viewTemplate() {
    if (this.socials.length < MAX_VIEW) {
      return html`<wui-flex flexDirection="column" gap="2">
        ${this.socials.map(
          social =>
            html`<wui-social-button
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social)
              }}
              icon=${social}
              name=${`Continue with ${social}`}
            ></wui-social-button>`
        )}
      </wui-flex>`
    }

    return html`<wui-flex gap="2">
      ${this.socials.slice(0, MAX_VIEW).map(
        social =>
          html`<wui-social-button
            data-testid=${`social-selector-${social}`}
            @click=${() => {
              this.onSocialClick(social)
            }}
            icon=${social}
          ></wui-social-button>`
      )}
      ${this.socials.length > MAX_VIEW
        ? html`
            <wui-social-button
              icon="more"
              @click=${this.onMoreSocialsClick.bind(this)}
            ></wui-social-button>
          `
        : null}
    </wui-flex>`
  }

  // -- Private Methods ----------------------------------- //
  onMoreSocialsClick() {
    RouterController.push('ConnectSocials')
  }

  async onSocialClick(socialProvider?: SocialProvider) {
    if (socialProvider) {
      AccountController.setSocialProvider(socialProvider, ChainController.state.activeChain)

      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_STARTED',
        properties: { provider: socialProvider }
      })
    }
    if (socialProvider === SocialProviderEnum.Farcaster) {
      RouterController.push('ConnectingFarcaster')
      const authConnector = ConnectorController.getAuthConnector()

      if (authConnector) {
        if (!AccountController.state.farcasterUrl) {
          try {
            const { url } = await authConnector.provider.getFarcasterUri()

            AccountController.setFarcasterUrl(url, ChainController.state.activeChain)
          } catch (error) {
            RouterController.goBack()
            SnackController.showError(error)
          }
        }
      }
    } else {
      RouterController.push('ConnectingSocial')

      const authConnector = ConnectorController.getAuthConnector()
      this.popupWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'width=600,height=800,scrollbars=yes'
      )

      try {
        if (authConnector && socialProvider) {
          const { uri } = await authConnector.provider.getSocialRedirectUri({
            provider: socialProvider
          })

          if (this.popupWindow && uri) {
            AccountController.setSocialWindow(this.popupWindow, ChainController.state.activeChain)
            this.popupWindow.location.href = uri
          } else {
            this.popupWindow?.close()
            throw new Error('Something went wrong')
          }
        }
      } catch (error) {
        this.popupWindow?.close()
        SnackController.showError('Something went wrong')
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-social-login-widget': W3mSocialLoginWidget
  }
}
