import { CoreHelperUtil, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

@customElement('w3m-downloads-view')
export class W3mDownloadsView extends LitElement {
  // -- Members ------------------------------------------- //
  private wallet = RouterController.state.data?.wallet

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-downloads-view')
    }

    return html`
      <wui-flex gap="xs" flexDirection="column" .padding=${['s', 's', 'l', 's'] as const}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private chromeTemplate() {
    if (!this.wallet?.chrome_store) {
      return null
    }

    return html`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Chrome Extension</wui-text>
    </wui-list-item>`
  }

  private iosTemplate() {
    if (!this.wallet?.app_store) {
      return null
    }

    return html`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">iOS App</wui-text>
    </wui-list-item>`
  }

  private androidTemplate() {
    if (!this.wallet?.play_store) {
      return null
    }

    return html`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Android App</wui-text>
    </wui-list-item>`
  }

  private homepageTemplate() {
    if (!this.wallet?.homepage) {
      return null
    }

    return html`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="paragraph-500" color="fg-100">Website</wui-text>
      </wui-list-item>
    `
  }

  private onChromeStore() {
    if (this.wallet?.chrome_store) {
      CoreHelperUtil.openHref(this.wallet.chrome_store, '_blank')
    }
  }

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

  private onHomePage() {
    if (this.wallet?.homepage) {
      CoreHelperUtil.openHref(this.wallet.homepage, '_blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-downloads-view': W3mDownloadsView
  }
}
