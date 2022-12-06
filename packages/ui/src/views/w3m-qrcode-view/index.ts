import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'

@customElement('w3m-qrcode-view')
export class W3mQrcodeView extends LitElement {
  public static styles = [ThemeUtil.globalCss]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header
        title="Scan the code"
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
      ></w3m-modal-header>

      <w3m-modal-content>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode-view': W3mQrcodeView
  }
}
