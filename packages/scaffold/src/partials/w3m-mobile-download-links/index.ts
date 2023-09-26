import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-mobile-download-links')
export class W3mMobileDownloadLinks extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public appStore?: string = undefined

  @property() public playStore?: string = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.appStore && this.playStore) {
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

    if (this.appStore) {
      return html`
        <wui-separator></wui-separator>

        <wui-list-item variant="icon" icon="appStore" iconVariant="square" chevron>
          <wui-text variant="paragraph-500" color="fg-100">Get the app</wui-text>
        </wui-list-item>
      `
    }

    if (this.playStore) {
      return html`
        <wui-separator></wui-separator>

        <wui-list-item variant="icon" icon="playStore" iconVariant="square" chevron>
          <wui-text variant="paragraph-500" color="fg-100">Get the app</wui-text>
        </wui-list-item>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-download-links': W3mMobileDownloadLinks
  }
}
