import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  ModalController,
  OptionsController,
  RouterController
} from '@reown/appkit-core'
import { state } from 'lit/decorators/state.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
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
    return html`
      <wui-flex class="connect" flexDirection="column">
        ${this.headerTemplate()}
        <wui-flex class="scrollable" flexDirection="column">
          ${this.heroTemplate()} ${this.authLoginTemplate()} ${this.separatorTemplate()}
          ${this.walletListTemplate()} ${this.guideTemplate()}
        </wui-flex>
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private headerTemplate() {
    const enableWalletConnect = OptionsController.state.enableWalletConnect

    return html`
      <wui-flex padding="4" alignItems="center" justifyContent="space-between">
        <wui-icon color="inverse" cursor="pointer" name="question" size="lg"></wui-icon>

        <wui-flex alignItems="center" columnGap="2">
          ${enableWalletConnect ? html`<w3m-qr-code-icon></w3m-qr-code-icon>` : null}
          <wui-icon
            color="inverse"
            cursor="pointer"
            name="close"
            size="lg"
            @click=${ModalController.close}
          ></wui-icon>
        </wui-flex>
      </wui-flex>
    `
  }

  private heroTemplate() {
    return html`
      <wui-flex padding="4" flexDirection="column" rowGap="4">
        <wui-text variant="md-regular" color="secondary">Welcome</wui-text>
        <wui-text variant="h5-regular" color="primary">${this.getHeaderText()}</wui-text>
      </wui-flex>
    `
  }

  private getHeaderText() {
    const enableWallets = OptionsController.state.enableWallets

    // If user has enabled wallets and email/socials
    if (enableWallets && this.authConnector) {
      return 'Login in or Connect Wallet'
    }

    // If user has disabled wallets, but enabled email/socials
    if (this.authConnector) {
      return 'Log in'
    }

    // Default
    return 'Connect Wallet'
  }

  private authLoginTemplate() {
    const showEmail = OptionsController.state.features?.email
    const socials = this.features?.socials && this.features.socials.length

    if (!this.authConnector) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" rowGap="2" padding="4">
        ${showEmail ? html`<w3m-email-login-widget></w3m-email-login-widget>` : null}
        ${socials
          ? html`<w3m-social-login-widget
              .socials=${this.features?.socials}
            ></w3m-social-login-widget>`
          : null}
      </wui-flex>
    `
  }

  private separatorTemplate() {
    const enableWallets = OptionsController.state.enableWallets

    if (!this.authConnector) {
      return null
    }

    if (!enableWallets) {
      return null
    }

    return html`
      <wui-flex .padding=${[2, 4, 2, 4]}>
        <wui-divider text="or"></wui-divider>
      </wui-flex>
    `
  }

  private walletListTemplate() {
    const enableWallets = OptionsController.state.enableWallets
    const emailShowWallets = this.features?.emailShowWallets

    if (!enableWallets) {
      return null
    }

    // In tg ios context, we have to preload the connection uri so we can use it to deeplink on user click
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      ConnectionController.connectWalletConnect().catch(_e => ({}))
    }

    if (this.authConnector && !emailShowWallets) {
      return html`
        <wui-flex rowGap="2" flexDirection="column" padding="4">
          <wui-list-select-wallet
            name="Continue with a Wallet"
            variant="secondary"
            icon="wallet"
            @click=${this.onContinueWalletClick.bind(this)}
          ></wui-list-select-wallet>
        </wui-flex>
      `
    }

    return html`
      <wui-flex rowGap="2" flexDirection="column" padding="4">
        <w3m-connector-list></w3m-connector-list>
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>
    `
  }

  private guideTemplate() {
    return html`
      <wui-flex alignItems="center" justifyContent="center" .padding=${[0, 0, 4, 0]}>
        <wui-link icon="" size="sm" variant="accent">Need a wallet?</wui-link>
      </wui-flex>
    `
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
