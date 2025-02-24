import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ConstantsUtil as CommonConstantsUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys
} from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  ConnectorController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  SnackController,
  type SocialProvider,
  type WalletGuideType
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { SocialProviderEnum } from '@reown/appkit-utils'

import styles from './styles.js'

const MAX_TOP_VIEW = 2
const MAXIMUM_LENGTH = 6

@customElement('w3m-social-login-widget')
export class W3mSocialLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private popupWindow?: Window | null

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

      try {
        if (authConnector && socialProvider) {
          if (!CoreHelperUtil.isTelegram()) {
            this.popupWindow = CoreHelperUtil.returnOpenHref(
              '',
              'popupWindow',
              'width=600,height=800,scrollbars=yes'
            )
          }

          if (this.popupWindow) {
            AccountController.setSocialWindow(this.popupWindow, ChainController.state.activeChain)
          } else if (!CoreHelperUtil.isTelegram()) {
            throw new Error('Something went wrong')
          }

          const { uri } = await authConnector.provider.getSocialRedirectUri({
            provider: socialProvider
          })

          if (!uri) {
            this.popupWindow?.close()
            throw new Error('Something went wrong')
          }

          if (this.popupWindow) {
            this.popupWindow.location.href = uri
          }

          if (CoreHelperUtil.isTelegram()) {
            SafeLocalStorage.setItem(SafeLocalStorageKeys.SOCIAL_PROVIDER, socialProvider)
            const parsedUri = CoreHelperUtil.formatTelegramSocialLoginUrl(uri)

            // eslint-disable-next-line consistent-return
            return CoreHelperUtil.openHref(parsedUri, '_top')
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
