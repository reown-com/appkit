import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import styles from './styles'

@customElement('gallery-placeholder')
export class GalleryPlaceholder extends LitElement {
  public static styles = [styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: 'xs' | 'sm' | 'md' | 'lg' = 'md'

  @property() public background: 'green' | 'red' | 'blue' = 'green'

  // -- render ------------------------------------------------------- //
  public render() {
    const classes = {
      [`placeholder-size-${this.size}`]: true,
      [`placeholder-bg-color-${this.background}`]: true
    }

    return html`<div class="${classMap(classes)}"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gallery-placeholder': GalleryPlaceholder
  }
}
