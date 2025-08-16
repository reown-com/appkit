import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Type ---------------------------------------------- //
type Variant = 'default' | 'light'

@customElement('wui-shimmer')
export class WuiShimmer extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public width = ''

  @property() public height = ''

  @property() public variant: Variant = 'default'

  @property({ type: Boolean }) public rounded = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      width: ${this.width};
      height: ${this.height};
    `
    this.dataset['rounded'] = this.rounded ? 'true' : 'false'

    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-shimmer': WuiShimmer
  }
}
