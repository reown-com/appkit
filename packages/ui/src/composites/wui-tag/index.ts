import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType, TagSize, TagVariant } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-tag')
export class WuiTag extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public variant: TagVariant = 'accent'

  @property() public size: TagSize = 'md'

  @property() public icon: IconType | undefined = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant
    this.dataset['size'] = this.size
    const textVariant = this.size === 'md' ? 'md-medium' : 'sm-medium'
    const iconSize = this.size === 'md' ? 'md' : 'sm'

    return html`
      ${this.icon ? html`<wui-icon size=${iconSize} name=${this.icon}></wui-icon>` : null}
      <wui-text
        display="inline"
        data-variant=${this.variant}
        variant=${textVariant}
        color="inherit"
      >
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
