import { RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss]

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.Connecting
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerData = this.getRouterData()
    const { name } = routerData

    return html`<w3m-modal-header title=${name}></w3m-modal-header>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
