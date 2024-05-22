import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'

@customElement('w3m-activity-view')
export class W3mActivityView extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'm', 'm', 'm']} gap="s">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-activity-view': W3mActivityView
  }
}
