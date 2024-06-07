import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@web3modal/core'
import { state } from 'lit/decorators/state.js'

// -- Constants ----------------------------------------- //
const TABS = 3
const TABS_PADDING = 48
const MODAL_MOBILE_VIEW_PX = 430

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private currentTab = 0

  @state() private chainTabs = ['evm', 'solana']

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ChainController.subscribeKey('activeChain', val => {
        this.currentTab = this.chainTabs.findIndex(tab => tab === val)
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    const protocol = ChainController.state.activeChain
    const index = this.chainTabs.findIndex(tab => tab === protocol)
    this.currentTab = index
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3xs', 's', 's', 's']}>
        <w3m-email-login-widget></w3m-email-login-widget>
        <w3m-social-login-widget></w3m-social-login-widget>
        ${this.walletListTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private onProtocolChange(value: number) {
    const chain = this.chainTabs[value] || 'evm'
    const newAdapter = ChainController.state.adapters?.find(a => a.chain === chain)

    if (newAdapter) {
      this.currentTab = value
      ChainController.setAdapter(newAdapter)
    }
  }

  private walletListTemplate() {
    const authConnector = this.connectors.find(c => c.type === 'AUTH')

    if (authConnector?.socials) {
      if (authConnector?.showWallets) {
        return html`
          <wui-flex flexDirection="column" gap="xs" .margin=${['xs', '0', '0', '0'] as const}>
            <w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>
            <w3m-connect-recent-widget></w3m-connect-recent-widget>
            <w3m-connect-announced-widget></w3m-connect-announced-widget>
            <w3m-connect-injected-widget></w3m-connect-injected-widget>
            <w3m-connect-coinbase-widget></w3m-connect-coinbase-widget>
            <w3m-connect-custom-widget></w3m-connect-custom-widget>
            <w3m-connect-recommended-widget></w3m-connect-recommended-widget>
            <wui-flex class="all-wallets" .margin=${['xs', '0', '0', '0'] as const}>
              <w3m-all-wallets-widget></w3m-all-wallets-widget>
            </wui-flex>
          </wui-flex>
        `
      }

      return html` <wui-list-button
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
      ></wui-list-button>`
    }

    return html`<w3m-wallet-login-list></w3m-wallet-login-list>`
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
