import { MathUtil, customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  type WalletGuideType
} from '@reown/appkit-core'
import { state } from 'lit/decorators/state.js'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

  @state() private features = OptionsController.state.features

  @property() private walletGuide: WalletGuideType = 'get-started'

  @state() private checked = false

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
    const connectEl = this.shadowRoot?.querySelector('.connect')
    connectEl?.removeEventListener('scroll', this.handleConnectListScroll.bind(this))
  }

  public override firstUpdated() {
    const connectEl = this.shadowRoot?.querySelector('.connect')
    // Use requestAnimationFrame to access scroll properties before the next repaint
    requestAnimationFrame(this.handleConnectListScroll.bind(this))
    connectEl?.addEventListener('scroll', this.handleConnectListScroll.bind(this))
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const legalCheckbox = OptionsController.state.features?.legalCheckbox

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const showLegalCheckbox =
      Boolean(legalUrl) && Boolean(legalCheckbox) && this.walletGuide === 'get-started'

    const disabled = showLegalCheckbox && !this.checked

    const classes = {
      connect: true,
      disabled
    }

    const socials = this.features?.socials
    const enableWallets = OptionsController.state.enableWallets

    const socialsExist = socials && socials.length
    const socialOrEmailLoginEnabled = socialsExist || this.authConnector

    const tabIndex = disabled ? -1 : undefined

    return html`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex flexDirection="column" class=${classMap(classes)}>
          <wui-flex
            flexDirection="column"
            .padding=${socialOrEmailLoginEnabled &&
            enableWallets &&
            this.walletGuide === 'get-started'
              ? ['3xs', 's', '0', 's']
              : ['3xs', 's', 's', 's']}
          >
            <w3m-email-login-widget
              walletGuide=${this.walletGuide}
              tabIdx=${ifDefined(tabIndex)}
            ></w3m-email-login-widget>
            <w3m-social-login-widget tabIdx=${ifDefined(tabIndex)}></w3m-social-login-widget>
            ${this.walletListTemplate(tabIndex)}
          </wui-flex>
        </wui-flex>
        ${this.guideTemplate(disabled)}
        <w3m-legal-footer></w3m-legal-footer>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private walletListTemplate(tabIndex?: number) {
    const socials = this.features?.socials
    const emailShowWallets = this.features?.emailShowWallets
    const enableWallets = OptionsController.state.enableWallets

    if (!enableWallets) {
      return null
    }
    // In tg ios context, we have to preload the connection uri so we can use it to deeplink on user click
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      ConnectionController.connectWalletConnect().catch(_e => ({}))
    }

    if (this.walletGuide === 'explore') {
      return null
    }

    if (this.authConnector && socials) {
      if (this.authConnector && emailShowWallets) {
        return html`
          <wui-flex flexDirection="column" gap="xs" .margin=${['xs', '0', '0', '0'] as const}>
            <w3m-connector-list tabIdx=${ifDefined(tabIndex)}></w3m-connector-list>
            <wui-flex class="all-wallets">
              <w3m-all-wallets-widget tabIdx=${ifDefined(tabIndex)}></w3m-all-wallets-widget>
            </wui-flex>
          </wui-flex>
        `
      }

      return html`<wui-list-button
        tabIdx=${ifDefined(tabIndex)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
      ></wui-list-button>`
    }

    return html`<w3m-wallet-login-list tabIdx=${ifDefined(tabIndex)}></w3m-wallet-login-list>`
  }

  private guideTemplate(disabled = false) {
    const socials = this.features?.socials
    const enableWallets = OptionsController.state.enableWallets

    const socialsExist = socials && socials.length

    const classes = {
      guide: true,
      disabled
    }

    const tabIndex = disabled ? -1 : undefined

    if (!this.authConnector && !socialsExist) {
      return null
    }

    if (!enableWallets) {
      return null
    }

    if (this.walletGuide === 'explore') {
      return html`
        <wui-flex
          flexDirection="column"
          .padding=${['0', '0', 'xl', '0']}
          class=${classMap(classes)}
        >
          <w3m-wallet-guide walletGuide=${this.walletGuide}></w3m-wallet-guide>
        </wui-flex>
      `
    }

    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['xl', '0', 'xl', '0']}
        class=${classMap(classes)}
      >
        <w3m-wallet-guide
          tabIdx=${ifDefined(tabIndex)}
          walletGuide=${this.walletGuide}
        ></w3m-wallet-guide>
      </wui-flex>
    `
  }

  private legalCheckboxTemplate() {
    if (this.walletGuide === 'explore') {
      return null
    }

    return html`<w3m-legal-checkbox
      @checkboxChange=${this.onCheckboxChange.bind(this)}
      data-testid="w3m-legal-checkbox"
    ></w3m-legal-checkbox>`
  }

  private handleConnectListScroll() {
    const connectEl = this.shadowRoot?.querySelector('.connect') as HTMLElement | undefined

    // If connect element is not found or is not overflowing do not apply the mask
    if (!connectEl || connectEl.scrollHeight <= 470) {
      return
    }

    connectEl.style.setProperty(
      '--connect-scroll--top-opacity',
      MathUtil.interpolate([0, 50], [0, 1], connectEl.scrollTop).toString()
    )
    connectEl.style.setProperty(
      '--connect-scroll--bottom-opacity',
      MathUtil.interpolate(
        [0, 50],
        [0, 1],
        connectEl.scrollHeight - connectEl.scrollTop - connectEl.offsetHeight
      ).toString()
    )
  }

  // -- Private Methods ----------------------------------- //
  private onContinueWalletClick() {
    RouterController.push('ConnectWallets')
  }

  private onCheckboxChange(event: CustomEvent<string>) {
    this.checked = Boolean(event.detail)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
