import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-banner')
export class WuiBanner extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public icon: IconType = 'externalLink'

  @property() public text = ''

  @property() public type: 'info' | 'success' | 'error' | 'warning' = 'info'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-banner': WuiBanner
  }
}
