import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  ConnectorController,
  CoreHelperUtil,
  NetworkController,
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

  @state() private protocolTabs = Object.keys(NetworkController.state.networks).map(item => ({
    icon: 'ethereum',
    label: item
  }))

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      NetworkController.subscribeKey('activeProtocol', val => {
        this.currentTab = this.protocolTabs.findIndex(tab => tab.label === val)
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    const protocol = NetworkController.state.activeProtocol
    const index = this.protocolTabs.findIndex(tab => tab.label === protocol)
    this.currentTab = index
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3xs', 's', 's', 's']}>
        <wui-tabs
          style="min-height:36px;"
          .onTabChange=${this.onProtocolChange.bind(this)}
          .activeTab=${this.currentTab}
          localTabWidth=${CoreHelperUtil.isMobile() && window.innerWidth < MODAL_MOBILE_VIEW_PX
            ? `${(window.innerWidth - TABS_PADDING) / TABS}px`
            : '104px'}
          .tabs=${this.protocolTabs}
        ></wui-tabs>
        <w3m-email-login-widget></w3m-email-login-widget>
        <w3m-social-login-widget></w3m-social-login-widget>
        ${this.walletListTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private onProtocolChange(value: number) {
    const protocol = this.protocolTabs[value]?.label || 'evm'
    const newAdapter = NetworkController.state.adaptersV2?.find(a => a.protocol === protocol)

    if (newAdapter) {
      this.currentTab = value
      NetworkController.setAdapter(newAdapter)
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
