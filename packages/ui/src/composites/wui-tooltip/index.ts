import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { PlacementType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-tooltip')
export class WuiTooltip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public placement: PlacementType = 'top'

  @property() public message = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-icon
        data-placement=${this.placement}
        color="fg-100"
        size="inherit"
        name="cursor"
      ></wui-icon>
      <wui-text color="inherit" variant="small-500">${this.message}</wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tooltip': WuiTooltip
  }
}
