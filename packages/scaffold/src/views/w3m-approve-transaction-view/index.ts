import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

@customElement('w3m-approve-transaction-view')
export class W3mApproveTransactionView extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<p>Hello Transaction</p>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-approve-transaction-view': W3mApproveTransactionView
  }
}
