import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-text'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { PlacementType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-tooltip')
export class WuiTooltip extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public placement: PlacementType = 'top'

  @property() public message = ''

  // -- Render -------------------------------------------- //
  public render() {
    return html`<wui-icon
        placement=${this.placement}
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
