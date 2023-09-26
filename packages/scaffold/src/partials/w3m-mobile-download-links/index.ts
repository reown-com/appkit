import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-mobile-download-links')
export class W3mMobileDownloadLinks extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-separator></wui-separator>

      <wui-list-item variant="icon" icon="appStore" iconVariant="square" chevron>
        <wui-text variant="paragraph-500" color="fg-100">App Store</wui-text>
      </wui-list-item>

      <wui-list-item variant="icon" icon="playStore" iconVariant="square" chevron>
        <wui-text variant="paragraph-500" color="fg-100">Play Store</wui-text>
      </wui-list-item>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-download-links': W3mMobileDownloadLinks
  }
}
