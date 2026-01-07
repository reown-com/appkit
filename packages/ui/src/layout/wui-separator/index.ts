import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-separator')
export class WuiSeparator extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public text? = ''
  @property() public bgColor: 'primary' | 'secondary' = 'primary'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['bgColor'] = this.bgColor

    return html`${this.template()}`
  }

  // -- Private ------------------------------------------- //
  private template() {
    if (this.text) {
      return html`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-separator': WuiSeparator
  }
}
