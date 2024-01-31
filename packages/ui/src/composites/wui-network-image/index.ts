import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { networkSvgSm } from '../../assets/svg/networkSm.js'
import { networkSvgMd } from '../../assets/svg/networkMd.js'
import { networkSvgLg } from '../../assets/svg/networkLg.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-network-image')
export class WuiNetworkImage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xl' | 'xs' | 'mdl' | 'xxs'> = 'md'

  @property() public name = 'uknown'

  @property() public imageSrc?: string

  @property({ type: Boolean }) public selected?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    const networkImagesBySize = { sm: networkSvgSm, md: networkSvgMd, lg: networkSvgLg }
    this.style.cssText = `
      --local-stroke: ${
        this.selected ? 'var(--wui-color-accent-100)' : 'var(--wui-gray-glass-010)'
      };
      --local-path: var(--wui-path-network-${this.size});
      --local-width:  var(--wui-width-network-${this.size});
      --local-height:  var(--wui-height-network-${this.size});
      --local-icon-size:  var(--wui-icon-size-network-${this.size});
    `

    // eslint-disable-next-line no-nested-ternary
    return html`${this.templateVisual()} ${networkImagesBySize[this.size]}`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="networkPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-image': WuiNetworkImage
  }
}
