import { AccountCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { zorbImageSVG } from '../../utils/Zorb'
import styles from './styles'

@customElement('w3m-zorb-ens-image')
export class W3mZorbImage extends LitElement {
  public static styles = [styles]

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
  }

  // -- state & properties ------------------------------------------- //
  @property() public address = ''
  @property() public size = ''
  @property() public ens = ''

  // -- private ----------------------------------------------------- //

  private ensAvatar() {
    return html`<img
      src="${this.ens}"
      alt="ens-avatar"
      class="${this.size === '24' ? 'w3m-ens-small-image ' : 'w3m-ens-large-image '}"
    />`
  }

  private zorbAvatar() {
    const renderedZorb = zorbImageSVG(AccountCtrl.state.address, this.size)

    return html`<div>${renderedZorb}</div> `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`${this.ens ? this.ensAvatar() : this.zorbAvatar()}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-zorb-ens-image': W3mZorbImage
  }
}
