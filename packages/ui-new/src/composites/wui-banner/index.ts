import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../wui-icon-box/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-banner')
export class WuiBanner extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public icon: IconType = 'externalLink'

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex gap="1xs" alignItems="center">
        <wui-icon-box
          size="sm"
          iconcolor="fg-200"
          backgroundcolor="fg-200"
          icon=${this.icon}
          background="transparent"
        ></wui-icon-box>
        <wui-text variant="small-400" color="fg-200">${this.text}</wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-banner': WuiBanner
  }
}
