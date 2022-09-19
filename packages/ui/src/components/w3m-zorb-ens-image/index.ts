import { AccountCtrl, ClientCtrl } from '@web3modal/core'
import type { FetchEnsAvatarOpts } from '@web3modal/ethereum'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { useScript, ZorbPackageScript } from '../../utils/UiHelpers'

@customElement('w3m-zorb-ens-image')
export class W3mZorbImage extends LitElement {
  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getENSAvatar()
    useScript(ZorbPackageScript)
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
    return html`<img src="${this.ens}" alt="ens-avatar" class="w3m-ens-avatar" />`
  }

  private zorbAvatar() {
    return html` <zora-zorb address=${this.address} size=${this.size}></zora-zorb> `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html` <div>${this.ens ? this.ensAvatar() : this.zorbAvatar()}</div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-zorb-ens-image': W3mZorbImage
  }
}
