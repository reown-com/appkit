import { AccountCtrl, ClientCtrl } from '@web3modal/core'
import type { FetchEnsAvatarOpts } from '@web3modal/ethereum'
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
    this.getENSAvatar()
  }

  // -- state & properties ------------------------------------------- //
  @property() public address = ''
  @property() public size = ''
  @property() public ens = ''

  // -- private ----------------------------------------------------- //
  private async getENSAvatar() {
    try {
      const opts: FetchEnsAvatarOpts = {
        addressOrName: this.address,
        chainId: AccountCtrl.state.chainId
      }
      const ens = await ClientCtrl.ethereum().fetchEnsAvatar(opts)
      if (ens) this.ens = ens
    } catch (e) {
      throw new Error('No Balance Details')
    }
  }

  private ensAvatar() {
    return html`<img
      src="${this.ens}"
      alt="ens-avatar"
      class="${this.size === 'sm' ? 'w3m-ens-small-image ' : 'w3m-ens-large-image '}"
    />`
  }

  private zorbAvatar() {
    const renderedZorb = zorbImageSVG(this.address, this.size)

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
