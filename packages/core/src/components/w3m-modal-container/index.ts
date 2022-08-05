import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import transparentNoise from '../../icons/transparentNoise'
import Whatamesh from '../../libs/Whatamesh'
import styles from './styles'

/**
 * Component
 */
@customElement('w3m-modal-container')
export class W3mModalContainer extends LitElement {
  public static styles = styles

  public firstUpdated() {
    const gradient = new Whatamesh()
    const canvas = this.renderRoot.querySelector('#w3m-gradient-canvas')
    gradient.initGradient(canvas)
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  @state() private open = true

  protected render() {
    return html`
      <div class="w3m-modal-overlay">
        ${this.open
          ? html`
              <div class="w3m-modal-container">
                <canvas class="w3m-modal-media" id="w3m-gradient-canvas"></canvas>
                ${transparentNoise}
                <div class="w3m-modal-content">Hellooo</div>
              </div>
            `
          : null}
      </div>
    `
  }
}

/**
 * Types
 */
declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-container': W3mModalContainer
  }
}
