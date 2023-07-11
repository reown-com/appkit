import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-network-image')
export class WuiNetworkImage extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public name = 'uknown'

  @property() public imageSrc?: string

  // -- Render -------------------------------------------- //
  public render() {
    return html`${this.templateVisual()}`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>
        <svg width="48" height="53" fill="none">
          <path
            d="M20.041 1.061a7.915 7.915 0 0 1 7.918 0l16.082 9.29A7.922 7.922 0 0 1 48 17.21v18.578c0 2.83-1.51 5.445-3.959 6.86l-16.082 9.29a7.915 7.915 0 0 1-7.918 0l-16.082-9.29A7.922 7.922 0 0 1 0 35.79V17.211c0-2.83 1.51-5.445 3.959-6.86l16.082-9.29Z"
          />
        </svg>`
    }

    return html`<wui-icon size="inherit" color="inherit" name="walletPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-image': WuiNetworkImage
  }
}
