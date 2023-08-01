import type { RouterControllerState } from '@web3modal/core'
import { ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'

// -- Helpers ------------------------------------------- //
function headings() {
  const connectorName = RouterController.state.data?.connector?.name
  const listingName = RouterController.state.data?.listing?.name
  const networkName = RouterController.state.data?.network?.name
  const name = listingName ?? connectorName

  return {
    Connect: 'Connect Wallet',
    Account: 'Account',
    ConnectingExternal: name ?? 'Connect Wallet',
    ConnectingWalletConnect: name ?? 'WalletConnect',
    Networks: 'Choose Network',
    SwitchNetwork: networkName ?? 'Switch Network',
    AllWallets: 'All Wallets'
  }
}

@customElement('w3m-header')
export class W3mHeader extends LitElement {
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
      <wui-flex
        .padding=${['l', '2l', 'l', '2l'] as const}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.dynamicButtonTemplate()}
        <wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>
        <wui-icon-link icon="close" @click=${ModalController.close}></wui-icon-link>
      </wui-flex>
      <wui-separator></wui-separator>
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

    return html`<wui-icon-link id="dynamic" icon="helpCircle" @click=${() => null}></wui-icon-link>`
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
    if (history.length > 1 && !this.showBack && buttonEl) {
      await animate(buttonEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
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
