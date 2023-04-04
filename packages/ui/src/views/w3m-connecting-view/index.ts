import { CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss]

  // -- private ------------------------------------------------------ //
  private desktopTemplate() {
    return null
  }

  private mobileTemplate() {
    return null
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerData = CoreUtil.getConnectingRouterData()
    const { name } = routerData
    const isMobile = CoreUtil.isMobile()

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      ${isMobile ? this.mobileTemplate() : this.desktopTemplate()}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
