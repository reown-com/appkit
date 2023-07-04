import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

@customElement('gallery-container')
export class GalleryContainer extends LitElement {
  public static styles = [styles]

  // -- state & properties ------------------------------------------- //
  @property() public width = '0'

  @property() public height? = 'auto'

  // -- render ------------------------------------------------------- //
  public render() {
    const styles = `--container-width: ${this.width}px; --container-height: ${this.height}px;`

    return html`<div style=${styles}><slot></slot></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gallery-container': GalleryContainer
  }
}
