import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'

@customElement('w3m-account-activity-widget')
export class W3mAccountActivityWidget extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<w3m-activity-list page="account"></w3m-activity-list>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-activity-widget': W3mAccountActivityWidget
  }
}
