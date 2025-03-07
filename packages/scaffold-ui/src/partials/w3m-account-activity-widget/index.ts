import { LitElement, html } from 'lit'

import { customElement } from '@reown/appkit-ui'

import '../w3m-activity-list/index.js'
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
