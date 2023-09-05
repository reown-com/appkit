import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'
import type { ColorType, SizeType } from '../../utils/TypesUtil.js'

@customElement('wui-loading-spinner')
export class WuiLoadingSpinner extends LitElement {
  public static override styles = [resetStyles, styles]

  @property() public color: ColorType = 'accent-100'

  @property() public size: Exclude<SizeType, 'inherit' | 'xs' | 'xxs'> = 'lg'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `--local-color: var(--wui-color-${this.color});`

    this.dataset['size'] = this.size

    return html`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-loading-spinner': WuiLoadingSpinner
  }
}
