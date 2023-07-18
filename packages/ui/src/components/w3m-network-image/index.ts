import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-network-image')
export class W3mNetworkImage extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public chainId = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    const src = UiUtil.getChainIcon(this.chainId)

    if (src) {
      return html`
        <svg
          width="54"
          height="59"
          viewBox="0 0 54 59"
          fill="none"
          data-testid="component-network-logo-svg"
        >
          <image href=${src} />
          <image href=${src} width="54" height="59" />
          <path
            d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
          />
        </svg>
      `
    }

    return html`${SvgUtil.NETWORK_PLACEHOLDER}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-image': W3mNetworkImage
  }
}
