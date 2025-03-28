import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { state } from 'lit/decorators/state.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  type Connector,
  ConnectorController,
  CoreHelperUtil,
  type Features,
  OptionsController,
  OptionsStateController,
  RouterController,
  type WalletGuideType
} from '@reown/appkit-controllers'
import { MathUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-button'
import '@reown/appkit-ui/wui-separator'
import { ConstantsUtil as AppKitConstantsUtil } from '@reown/appkit-utils'

import '../../partials/w3m-email-login-widget/index.js'
import '../../partials/w3m-legal-checkbox/index.js'
import '../../partials/w3m-legal-footer/index.js'
import '../../partials/w3m-social-login-widget/index.js'
import '../../partials/w3m-wallet-guide/index.js'
import '../../partials/w3m-wallet-login-list/index.js'
import { WalletUtil } from '../../utils/WalletUtil.js'
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const SCROLL_THRESHOLD = 470

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

  @state() private noAdapters = ChainController.state.noAdapters

  @property() private walletGuide: WalletGuideType = 'get-started'

  @state() private checked = OptionsStateController.state.isLegalCheckboxChecked

  @state() private isEmailEnabled = this.features?.email && !ChainController.state.noAdapters

  @state() private isSocialEnabled =
    this.features?.socials && this.features.socials.length > 0 && !ChainController.state.noAdapters

  @state() private isAuthEnabled = this.checkIfAuthEnabled(this.connectors)

  private resizeObserver?: ResizeObserver

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.authConnector = this.connectors.find(c => c.type === 'AUTH')
        this.isAuthEnabled = this.checkIfAuthEnabled(this.connectors)
      }),
      OptionsController.subscribeKey('features', val =>
        this.setEmailAndSocialEnableCheck(val, this.noAdapters)
      ),
      OptionsController.subscribeKey('enableWallets', val => (this.enableWallets = val)),
      ChainController.subscribeKey('noAdapters', val =>
        this.setEmailAndSocialEnableCheck(this.features, val)
      ),
      OptionsStateController.subscribeKey('isLegalCheckboxChecked', val => (this.checked = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.disconnect()
    const connectEl = this.shadowRoot?.querySelector('.connect')
    connectEl?.removeEventListener('scroll', this.handleConnectListScroll.bind(this))
  }

  public override firstUpdated() {
    const connectEl = this.shadowRoot?.querySelector('.connect')
    if (connectEl) {
      // Use requestAnimationFrame to access scroll properties before the next repaint
      requestAnimationFrame(this.handleConnectListScroll.bind(this))
      connectEl?.addEventListener('scroll', this.handleConnectListScroll.bind(this))
      this.resizeObserver = new ResizeObserver(() => {
        this.handleConnectListScroll()
      })
      this.resizeObserver?.observe(connectEl)
      this.handleConnectListScroll()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    const isLegalCheckbox = OptionsController.state.features?.legalCheckbox

    const legalUrl = termsConditionsUrl || privacyPolicyUrl
    const isShowLegalCheckbox =
      Boolean(legalUrl) && Boolean(isLegalCheckbox) && this.walletGuide === 'get-started'

    const isDisabled = isShowLegalCheckbox && !this.checked

    const classes = {
      connect: true,
      disabled: isDisabled
    }

    const isEnableWalletGuide = OptionsController.state.enableWalletGuide

    const isEnableWallets = this.enableWallets

    const socialOrEmailLoginEnabled = this.isSocialEnabled || this.authConnector

    const tabIndex = isDisabled ? -1 : undefined

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
            isEnableWallets &&
            isEnableWalletGuide &&
            this.walletGuide === 'get-started'
              ? ['3xs', 's', '0', 's']
              : ['3xs', 's', 's', 's']}
          >
            ${this.renderConnectMethod(tabIndex)}
          </wui-flex>
        </wui-flex>
        ${this.guideTemplate(isDisabled)}
        <w3m-legal-footer></w3m-legal-footer>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private setEmailAndSocialEnableCheck(features: Features | undefined, noAdapters: boolean) {
    this.isEmailEnabled = features?.email && !noAdapters
    this.isSocialEnabled = features?.socials && features.socials.length > 0 && !noAdapters
    this.features = features
    this.noAdapters = noAdapters
  }

  private checkIfAuthEnabled(connectors: Connector[]) {
    const namespacesWithAuthConnector = connectors
      .filter(c => c.type === AppKitConstantsUtil.CONNECTOR_TYPE_AUTH)
      .map(i => i.chain)
    const authSupportedNamespaces = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS

    return authSupportedNamespaces.some(ns => namespacesWithAuthConnector.includes(ns))
  }

  private renderConnectMethod(tabIndex?: number) {
    const connectMethodsOrder = WalletUtil.getConnectOrderMethod(this.features, this.connectors)

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
        return this.isSocialEnabled && this.isAuthEnabled
      case 'email':
        return this.isEmailEnabled && this.isAuthEnabled
      default:
        return null
    }
  }

  private checkIsThereNextMethod(currentIndex: number): string | undefined {
    const connectMethodsOrder = WalletUtil.getConnectOrderMethod(this.features, this.connectors)

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
        const isNextMethodSocial = nextEnabledMethod === 'social'

        return this.isAuthEnabled && this.isEmailEnabled && !isNextMethodSocial && nextEnabledMethod
          ? html`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`
          : null
      }
      case 'social': {
        const isNextMethodEmail = nextEnabledMethod === 'email'

        return this.isAuthEnabled && this.isSocialEnabled && !isNextMethodEmail && nextEnabledMethod
          ? html`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`
          : null
      }
      default:
        return null
    }
  }

  private emailTemplate(tabIndex?: number) {
    if (!this.isEmailEnabled || !this.isAuthEnabled) {
      return null
    }

    return html`<w3m-email-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${ifDefined(tabIndex)}
    ></w3m-email-login-widget>`
  }

  private socialListTemplate(tabIndex?: number) {
    if (!this.isSocialEnabled || !this.isAuthEnabled) {
      return null
    }

    return html`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${ifDefined(tabIndex)}
    ></w3m-social-login-widget>`
  }

  private walletListTemplate(tabIndex?: number) {
    const isEnableWallets = this.enableWallets
    const isCollapseWalletsOldProp = this.features?.emailShowWallets === false
    const isCollapseWallets = this.features?.collapseWallets
    const shouldCollapseWallets = isCollapseWalletsOldProp || isCollapseWallets

    if (!isEnableWallets) {
      return null
    }
    // In tg ios context, we have to preload the connection uri so we can use it to deeplink on user click
    if ((CoreHelperUtil.isTelegram() || CoreHelperUtil.isSafari()) && CoreHelperUtil.isIos()) {
      ConnectionController.connectWalletConnect().catch(_e => ({}))
    }

    if (this.walletGuide === 'explore') {
      return null
    }

    const hasOtherMethods = this.isAuthEnabled && (this.isEmailEnabled || this.isSocialEnabled)

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
    const isEnableWalletGuide = OptionsController.state.enableWalletGuide

    if (!isEnableWalletGuide) {
      return null
    }

    const classes = {
      guide: true,
      disabled
    }

    const tabIndex = disabled ? -1 : undefined

    if (!this.authConnector && !this.isSocialEnabled) {
      return null
    }

    return html`
      ${this.walletGuide === 'explore' && !ChainController.state.noAdapters
        ? html`<wui-separator data-testid="wui-separator" id="explore" text="or"></wui-separator>`
        : null}
      <wui-flex flexDirection="column" .padding=${['l', '0', '0', '0']} class=${classMap(classes)}>
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

    return html`<w3m-legal-checkbox data-testid="w3m-legal-checkbox"></w3m-legal-checkbox>`
  }

  private handleConnectListScroll() {
    const connectEl = this.shadowRoot?.querySelector('.connect') as HTMLElement | undefined

    if (!connectEl) {
      return
    }

    const shouldApplyMask = connectEl.scrollHeight > SCROLL_THRESHOLD

    if (shouldApplyMask) {
      connectEl.style.setProperty(
        '--connect-mask-image',
        `linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
          black 40px,
          black calc(100% - 40px),
          rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
        )`
      )

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
    } else {
      connectEl.style.setProperty('--connect-mask-image', 'none')
      connectEl.style.setProperty('--connect-scroll--top-opacity', '0')
      connectEl.style.setProperty('--connect-scroll--bottom-opacity', '0')
    }
  }

  // -- Private Methods ----------------------------------- //
  private onContinueWalletClick() {
    RouterController.push('ConnectWallets')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
