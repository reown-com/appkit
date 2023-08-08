import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import styles from './styles'

@customElement('gallery-placeholder')
export class GalleryPlaceholder extends LitElement {
  public static override styles = [styles]

  // -- state & properties ------------------------------------------- //
  @property() public size: 'lg' | 'md' | 'sm' | 'xs' = 'md'

  @property() public background: 'blue' | 'green' | 'red' = 'green'

  @property({ type: Boolean }) public margin = false

  // -- render ------------------------------------------------------- //
  public override render() {
    const classes = {
      [`placeholder-size-${this.size}`]: true,
      [`placeholder-bg-color-${this.background}`]: true,
      'placeholder-margin': this.margin
    }

    return html`<div class="${classMap(classes)}"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gallery-placeholder': GalleryPlaceholder
  }
}
