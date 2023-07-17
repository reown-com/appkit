import type { RouterControllerState } from '@web3modal/core'
import { ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'

// -- Helpers ------------------------------------------- //
function headings() {
  const connectorName = RouterController.state.data?.connector.name

  return {
    Connect: 'Connect Wallet',
    Account: 'Account',
    ConnectingExternal: connectorName ?? 'Connect Wallet',
    ConnectingWalletConnect: connectorName ?? 'WalletConnect',
    Networks: 'Choose Network'
  }
}

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private heading = 'Connect Wallet'

  @state() private showBack = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        RouterController.subscribeKey('view', val => {
          this.onViewChange(val)
          this.onHistoryChange()
        })
      ]
    )
  }

  disconnectCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex
        .padding=${['m', 'l', 'm', 'l'] as const}
        justifyContent="space-between"
        alignItems="center"
      >
        <wui-icon-link id="hmm" icon="clock" @click=${RouterController.goBack}></wui-icon-link>
        <wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>
        <wui-icon-link icon="close" @click=${ModalController.close}></wui-icon-link>
      </wui-flex>
      <wui-separator></wui-separator>
    `
  }

  // -- Private ------------------------------------------- //
  private async onViewChange(view: RouterControllerState['view']) {
    const headingEl = this.shadowRoot?.querySelector('wui-text')
    if (headingEl) {
      const preset = headings()[view]
      await animate(headingEl, { opacity: 0 }, { duration: 0.2 }).finished
      this.heading = preset
      animate(headingEl, { opacity: 1 }, { duration: 0.2 })
    }
  }

  private async onHistoryChange() {
    const { history } = RouterController.state
    const buttonEl = this.shadowRoot?.querySelector('#hmm')
    if (history.length > 1 && !this.showBack && buttonEl) {
      await animate(buttonEl, { opacity: [0, 1] }, { duration: 0.2 }).finished
      this.showBack = true
      animate(buttonEl, { opacity: [1, 0] }, { duration: 0.2 })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
