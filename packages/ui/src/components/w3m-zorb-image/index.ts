import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { useScript, ZorbPackageScript } from '../../utils/UiHelpers'

@customElement('w3m-zorb-image')
export class W3mZorbImage extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    useScript(ZorbPackageScript)
  }

  // -- state & properties ------------------------------------------- //
  @property() public address = ''
  @property() public size = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html` <zora-zorb address=${this.address} size=${this.size}></zora-zorb> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-zorb-image': W3mZorbImage
  }
}
