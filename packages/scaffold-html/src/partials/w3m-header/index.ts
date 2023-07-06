import { ModalController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex padding="l" justifyContent="space-between" alignItems="center">
        <wui-icon-link icon="copy"></wui-icon-link>
        <wui-text variant="paragraph-700" color="fg-100">Connect wallet</wui-text>
        <wui-icon-link icon="close" @click=${ModalController.close}></wui-icon-link>
      </wui-flex>
      <wui-separator></wui-separator>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
