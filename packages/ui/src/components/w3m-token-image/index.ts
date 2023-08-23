import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-token-image')
export class W3mTokenImage extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public symbol?: string = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const src = UiUtil.getTokenIcon(this.symbol ?? '')

    return src
      ? html`
          <div>
            <img
              crossorigin="anonymous"
              src=${src}
              alt=${this.id}
              data-testid="component-token-image"
            />
          </div>
        `
      : SvgUtil.TOKEN_PLACEHOLDER
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-token-image': W3mTokenImage
  }
}
