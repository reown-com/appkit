import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

@customElement('gallery-container')
export class GalleryContainer extends LitElement {
  public static styles = [styles]

  // -- state & properties ------------------------------------------- //
  @property() public width = '0'

  // -- render ------------------------------------------------------- //
  public render() {
    const maxWidth = `--container-width: ${this.width}px;`

    return html`<div style=${maxWidth}><slot></slot></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gallery-container': GalleryContainer
  }
}
