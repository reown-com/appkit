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
import { ConstantsUtil } from '@reown/appkit-core'

const defaultConnectMethodsOrder = ConstantsUtil.DEFAULT_FEATURES.connectMethodsOrder

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

  @state() private features = OptionsController.state.features

  @state() private enableWallets = OptionsController.state.enableWallets

  @property() private walletGuide: WalletGuideType = 'get-started'

  @state() private checked = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.authConnector = this.connectors.find(c => c.type === 'AUTH')
      }),
      OptionsController.subscribeKey('features', val => (this.features = val)),
      OptionsController.subscribeKey('enableWallets', val => (this.enableWallets = val))
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

    const enableWalletGuide = OptionsController.state.enableWalletGuide

    const socials = this.features?.socials
    const enableWallets = this.enableWallets

    const socialsExist = socials && socials.length
    const socialOrEmailLoginEnabled = socialsExist || this.authConnector

    const tabIndex = disabled ? -1 : undefined

    return html`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex
          data-testid="w3m-connect-scroll-view"
          flexDirection="column"
          class=${classMap(classes)}
        >
          <wui-flex
            class="connect-methods"
            flexDirection="column"
            gap="s"
            .padding=${socialOrEmailLoginEnabled &&
            enableWallets &&
            enableWalletGuide &&
            this.walletGuide === 'get-started'
              ? ['3xs', 's', '0', 's']
              : ['3xs', 's', 's', 's']}
          >
            ${this.renderConnectMethod(tabIndex)}
          </wui-flex>
        </wui-flex>
        ${this.guideTemplate(disabled)}
        <w3m-legal-footer></w3m-legal-footer>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private renderConnectMethod(tabIndex?: number) {
    const connectMethodsOrder = this.features?.connectMethodsOrder || defaultConnectMethodsOrder

    if (!connectMethodsOrder) {
      return null
    }

    return html`${connectMethodsOrder.map((method, index) => {
      switch (method) {
        case 'email':
          return html`${this.emailTemplate(tabIndex)} ${this.separatorTemplate(index, 'email')}`
        case 'social':
          return html`${this.socialListTemplate(tabIndex)}
          ${this.separatorTemplate(index, 'social')}`
        case 'wallet':
          return html`${this.walletListTemplate(tabIndex)}
          ${this.separatorTemplate(index, 'wallet')}`
        default:
          return null
      }
    })}`
  }

  private checkMethodEnabled(name: 'wallet' | 'social' | 'email') {
    switch (name) {
      case 'wallet':
        return this.enableWallets
      case 'social':
        return this.features?.socials && this.features?.socials.length > 0
      case 'email':
        return this.features?.email
      default:
        return null
    }
  }

  private checkIsThereNextMethod(currentIndex: number): string | undefined {
    const connectMethodsOrder = this.features?.connectMethodsOrder || defaultConnectMethodsOrder

    const nextMethod = connectMethodsOrder[currentIndex + 1] as
      | 'wallet'
      | 'social'
      | 'email'
      | undefined

    if (!nextMethod) {
      return undefined
    }

    const isNextMethodEnabled = this.checkMethodEnabled(nextMethod)

    if (isNextMethodEnabled) {
      return nextMethod
    }

    return this.checkIsThereNextMethod(currentIndex + 1)
  }

  private separatorTemplate(index: number, type: 'wallet' | 'email' | 'social') {
    const nextEnabledMethod = this.checkIsThereNextMethod(index)
    const isExplore = this.walletGuide === 'explore'

    switch (type) {
      case 'wallet': {
        const isWalletEnable = this.enableWallets

        return isWalletEnable && nextEnabledMethod && !isExplore
          ? html`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`
          : null
      }
      case 'email': {
        const isEmailEnabled = this.features?.email
        const isNextMethodSocial = nextEnabledMethod === 'social'

        if (isExplore) {
          return null
        }

        return isEmailEnabled && !isNextMethodSocial && nextEnabledMethod
          ? html`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`
          : null
      }
      case 'social': {
        const isSocialEnabled = this.features?.socials && this.features?.socials.length > 0
        const isNextMethodEmail = nextEnabledMethod === 'email'

        if (isExplore) {
          return null
        }

        return isSocialEnabled && !isNextMethodEmail && nextEnabledMethod
          ? html`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`
          : null
      }
      default:
        return null
    }
  }

  private emailTemplate(tabIndex?: number) {
    const emailEnabled = this.features?.email
    const isCreateWalletPage = this.walletGuide === 'explore'

    if (!isCreateWalletPage && !emailEnabled) {
      return null
    }

    return html`<w3m-email-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${ifDefined(tabIndex)}
    ></w3m-email-login-widget>`
  }

  private socialListTemplate(tabIndex?: number) {
    const isSocialsEnabled = this.features?.socials && this.features?.socials.length > 0
    const isCreateWalletPage = this.walletGuide === 'explore'

    if (!isCreateWalletPage && !isSocialsEnabled) {
      return null
    }

    return html`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${ifDefined(tabIndex)}
    ></w3m-social-login-widget>`
  }

  private walletListTemplate(tabIndex?: number) {
    const enableWallets = this.enableWallets
    const collapseWalletsOldProp = this.features?.emailShowWallets === false
    const collapseWallets = this.features?.collapseWallets
    const shouldCollapseWallets = collapseWalletsOldProp || collapseWallets

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

    const hasEmail = this.features?.email
    const hasSocials = this.features?.socials && this.features.socials.length > 0
    const hasOtherMethods = hasEmail || hasSocials

    if (hasOtherMethods && shouldCollapseWallets) {
      return html`<wui-list-button
        data-testid="w3m-collapse-wallets-button"
        tabIdx=${ifDefined(tabIndex)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
      ></wui-list-button>`
    }

    return html`<w3m-wallet-login-list tabIdx=${ifDefined(tabIndex)}></w3m-wallet-login-list>`
  }

  private guideTemplate(disabled = false) {
    const enableWalletGuide = OptionsController.state.enableWalletGuide

    if (!enableWalletGuide) {
      return null
    }

    const socials = this.features?.socials
    const socialsExist = socials && socials.length

    const classes = {
      guide: true,
      disabled
    }

    const tabIndex = disabled ? -1 : undefined

    if (!this.authConnector && !socialsExist) {
      return null
    }

    return html`
      ${this.walletGuide === 'explore'
        ? html`<wui-separator data-testid="wui-separator" id="explore" text="or"></wui-separator>`
        : null}
      <wui-flex flexDirection="column" .padding=${['s', '0', 'xl', '0']} class=${classMap(classes)}>
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
