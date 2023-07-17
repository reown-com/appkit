import { ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'

// -- Helpers ------------------------------------------- //

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private heading = 'Connect Wallet'

  public constructor() {
    super()
    this.unsubscribe.push(RouterController.subscribeKey('view', val => this.onViewChange(val)))
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
        <wui-icon-link icon="copy" @click=${RouterController.goBack}></wui-icon-link>
        <wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>
        <wui-icon-link icon="close" @click=${ModalController.close}></wui-icon-link>
      </wui-flex>
      <wui-separator></wui-separator>
    `
  }

  // -- Private ------------------------------------------- //
  private async onViewChange(view: string) {
    const headingEl = this.shadowRoot?.querySelector('wui-text')
    if (headingEl) {
      await animate(headingEl, { opacity: 0 }, { duration: 0.15 }).finished
      animate(headingEl, { opacity: 1 }, { duration: 0.15, delay: 0.05 })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
