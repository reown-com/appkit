import type { WcWallet } from '@web3modal/core'
import { CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-mobile-download-links')
export class W3mMobileDownloadLinks extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) wallet?: WcWallet = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      this.style.display = 'none'

      return null
    }
    const { app_store, play_store } = this.wallet
    const isMobile = CoreHelperUtil.isMobile()
    const isIos = CoreHelperUtil.isIos()
    const isAndroid = CoreHelperUtil.isAndroid()

    if (app_store && play_store && !isMobile) {
      return html`
        <wui-separator></wui-separator>

        <wui-flex gap="xs">
          <wui-list-item
            variant="icon"
            icon="appStore"
            iconVariant="square"
            @click=${this.onAppStore.bind(this)}
          >
            <wui-text variant="paragraph-500" color="fg-100">App Store</wui-text>
          </wui-list-item>

          <wui-list-item
            variant="icon"
            icon="playStore"
            iconVariant="square"
            @click=${this.onPlayStore.bind(this)}
          >
            <wui-text variant="paragraph-500" color="fg-100">Play Store</wui-text>
          </wui-list-item>
        </wui-flex>
      `
    }

    if (app_store && !isAndroid) {
      return html`
        <wui-separator></wui-separator>

        <wui-list-item
          variant="icon"
          icon="appStore"
          iconVariant="square"
          chevron
          @click=${this.onAppStore.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">Get the app</wui-text>
        </wui-list-item>
      `
    }

    if (play_store && !isIos) {
      return html`
        <wui-separator></wui-separator>

        <wui-list-item
          variant="icon"
          icon="playStore"
          iconVariant="square"
          chevron
          @click=${this.onPlayStore.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">Get the app</wui-text>
        </wui-list-item>
      `
    }

    this.style.display = 'none'

    return null
  }

  // -- Private ------------------------------------------- //
  private onAppStore() {
    if (this.wallet?.app_store) {
      CoreHelperUtil.openHref(this.wallet.app_store, '_blank')
    }
  }

  private onPlayStore() {
    if (this.wallet?.play_store) {
      CoreHelperUtil.openHref(this.wallet.play_store, '_blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-download-links': W3mMobileDownloadLinks
  }
}
