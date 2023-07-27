import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-image')
export class WuiImage extends LitElement {
  public static styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public src = './path/to/image.jpg'

  @property() public alt = 'Image'

  // -- Render -------------------------------------------- //
  public render() {
    return html`<img crossorigin="anonymous" src=${this.src} alt=${this.alt} />`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-image': WuiImage
  }
}
