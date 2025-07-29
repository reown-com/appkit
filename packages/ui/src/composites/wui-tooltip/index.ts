import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { PlacementType, TextType, TooltipSize } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const TEXT_SIZE = {
  sm: 'sm-regular',
  md: 'md-regular'
} as Record<TooltipSize, TextType>

@customElement('wui-tooltip')
export class WuiTooltip extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public placement: PlacementType = 'top'

  @property() public variant: 'shade' | 'fill' = 'fill'

  @property() public size: TooltipSize = 'md'

  @property() public message = ''

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant
    this.dataset['size'] = this.size

    return html`<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${TEXT_SIZE[this.size]}>${this.message}</wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tooltip': WuiTooltip
  }
}
