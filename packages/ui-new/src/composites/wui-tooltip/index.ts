import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { PlacementType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-tooltip')
export class WuiTooltip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public placement: PlacementType = 'top'

  @property() public variant: 'shade' | 'fill' = 'fill'

  @property() public message = ''

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant

    return html`<wui-icon
        data-placement=${this.placement}
        color="fg-100"
        size="inherit"
        name=${this.variant === 'fill' ? 'cursor' : 'cursorTransparent'}
      ></wui-icon>
      <wui-text color="inherit" variant="small-500">${this.message}</wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tooltip': WuiTooltip
  }
}
