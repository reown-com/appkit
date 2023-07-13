import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import { networkSvg } from '../../assets/svg/network'

@customElement('wui-network-image')
export class WuiNetworkImage extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public name = 'uknown'

  @property() public imageSrc?: string

  // -- Render -------------------------------------------- //
  public render() {
    return html`${this.templateVisual()} ${networkSvg}`
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
