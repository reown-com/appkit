import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-network-waiting')
export class W3mNetworkWaiting extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public chainId?: string = undefined

  @property() public isError = false

  @property() public label = ''

  // -- private ------------------------------------------------------ //
  private svgLoaderTemplate() {
    return html`
      <svg
        width="54"
        height="59"
        viewBox="0 0 54 59"
        fill="none"
        class="w3m-loader"
        data-testid="partial-network-waiting-svg"
      >
        <path
          id="w3m-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <use xlink:href="#w3m-loader-path" stroke-dasharray="54 118" stroke-dashoffset="172"></use>
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-error': this.isError
    }

    return html`
      <div class=${classMap(classes)}>
        ${this.svgLoaderTemplate()}
        <w3m-network-image
          chainId=${ifDefined(this.chainId)}
          data-testid="partial-network-waiting-image"
        ></w3m-network-image>
      </div>
      <w3m-text
        variant="medium-regular"
        color=${this.isError ? 'error' : 'primary'}
        data-testid="partial-network-waiting-text"
      >
        ${this.isError ? 'Switch declined' : this.label}
      </w3m-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-waiting': W3mNetworkWaiting
  }
}
