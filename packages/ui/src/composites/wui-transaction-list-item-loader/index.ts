import { LitElement, html } from 'lit'

import '../../components/wui-shimmer/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-transaction-thumbnail/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item-loader')
export class WuiTransactionListItemLoader extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" .padding=${['1', '2', '1', '2'] as const}>
        <wui-shimmer width="40px" height="40px" rounded></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="124px" height="16px" rounded></wui-shimmer>
          <wui-shimmer width="60px" height="14px" rounded></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" rounded></wui-shimmer>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item-loader': WuiTransactionListItemLoader
  }
}
