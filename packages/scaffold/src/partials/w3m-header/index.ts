import type { RouterControllerState } from '@web3modal/core'
import { ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles.js'

// -- Helpers ------------------------------------------- //
function headings() {
  const connectorName = RouterController.state.data?.connector?.name
  const walletName = RouterController.state.data?.wallet?.name
  const networkName = RouterController.state.data?.network?.name
  const name = walletName ?? connectorName

  return {
    Connect: 'Connect Wallet',
    Account: '',
    ConnectingExternal: name ?? 'Connect Wallet',
    ConnectingWalletConnect: name ?? 'WalletConnect',
    Networks: 'Choose Network',
    SwitchNetwork: networkName ?? 'Switch Network',
    AllWallets: 'All Wallets',
    WhatIsANetwork: 'What is a network?',
    WhatIsAWallet: 'What is a wallet?',
    GetWallet: 'Get a Wallet'
  }
}

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private heading = headings()[RouterController.state.view]

  @state() private showBack = false

  public constructor() {
    super()
    this.unsubscribe.push(
      RouterController.subscribeKey('view', val => {
        this.onViewChange(val)
        this.onHistoryChange()
      })
    )
  }

  disconnectCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex .padding=${this.getPadding()} justifyContent="space-between" alignItems="center">
        ${this.dynamicButtonTemplate()}
        <wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>
        <wui-icon-link icon="close" @click=${ModalController.close}></wui-icon-link>
      </wui-flex>
      ${this.separatorTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private dynamicButtonTemplate() {
    if (this.showBack) {
      return html`<wui-icon-link
        id="dynamic"
        icon="chevronLeft"
        @click=${RouterController.goBack}
      ></wui-icon-link>`
    }

    return html`<wui-icon-link
      data-view=${RouterController.state.view}
      id="dynamic"
      icon="helpCircle"
      @click=${this.handleHelpClick}
    ></wui-icon-link>`
  }

  private separatorTemplate() {
    if (RouterController.state.view !== 'Account') {
      return html` <wui-separator></wui-separator>`
    }

    return null
  }

  private getPadding() {
    if (RouterController.state.view !== 'Account') {
      return ['l', '2l', 'l', '2l'] as const
    }

    return ['l', '2l', '0', '2l'] as const
  }

  private handleHelpClick() {
    if (RouterController.state.view === 'Networks') {
      RouterController.push('WhatIsANetwork')
    } else {
      RouterController.push('WhatIsAWallet')
    }
  }

  private async onViewChange(view: RouterControllerState['view']) {
    const headingEl = this.shadowRoot?.querySelector('wui-text')
    if (headingEl) {
      const preset = headings()[view]
      await animate(headingEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
      this.heading = preset
      animate(headingEl, { opacity: [0, 1] }, { duration: 0.2 })
    }
  }

  private async onHistoryChange() {
    const { history } = RouterController.state
    const buttonEl = this.shadowRoot?.querySelector('#dynamic')
    const opacity = history[0] && RouterController.state.view === 'Networks' ? 0 : 1

    if (history.length > 1 && !this.showBack && buttonEl) {
      await animate(buttonEl, { opacity: [opacity, 0] }, { duration: 0.2 }).finished
      this.showBack = true
      animate(buttonEl, { opacity: [0, 1] }, { duration: 0.2 })
    } else if (history.length <= 1 && this.showBack && buttonEl) {
      await animate(buttonEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
      this.showBack = false
      animate(buttonEl, { opacity: [0, 1] }, { duration: 0.2 })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
