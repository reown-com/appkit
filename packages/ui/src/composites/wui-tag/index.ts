import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { TagType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-tag')
export class WuiTag extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TagType = 'main'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant

    return html`
      <wui-text data-variant=${this.variant} variant="mini-700" color="inherit">
        <slot></slot>
      </wui-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tag': WuiTag
  }
}
