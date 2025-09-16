import { LitElement, html } from 'lit'

import { CoreHelperUtil, EventsController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

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
      <wui-flex gap="2" flexDirection="column" .padding=${['3', '3', '4', '3'] as const}>
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
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
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
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
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
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
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
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `
  }

  private openStore(params: {
    href: string
    type: 'chrome_store' | 'app_store' | 'play_store' | 'homepage'
  }) {
    if (params.href && this.wallet) {
      EventsController.sendEvent({
        type: 'track',
        event: 'GET_WALLET',
        properties: {
          name: this.wallet.name,
          walletRank: this.wallet.order,
          explorerId: this.wallet.id,
          type: params.type
        }
      })
      CoreHelperUtil.openHref(params.href, '_blank')
    }
  }

  private onChromeStore() {
    if (this.wallet?.chrome_store) {
      this.openStore({ href: this.wallet.chrome_store, type: 'chrome_store' })
    }
  }

  private onAppStore() {
    if (this.wallet?.app_store) {
      this.openStore({ href: this.wallet.app_store, type: 'app_store' })
    }
  }

  private onPlayStore() {
    if (this.wallet?.play_store) {
      this.openStore({ href: this.wallet.play_store, type: 'play_store' })
    }
  }

  private onHomePage() {
    if (this.wallet?.homepage) {
      this.openStore({ href: this.wallet.homepage, type: 'homepage' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-downloads-view': W3mDownloadsView
  }
}
