import {
  ClientCtrl,
  ConnectModalCtrl,
  CoreHelpers,
  ExplorerCtrl,
  ModalToastCtrl
} from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-spinner'
import '../../components/w3m-text'
import '../../components/w3m-wallet-button'
import { global } from '../../utils/Theme'
import { getErrorMessage, getShadowRootElement, preloadImage } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-wallet-explorer-view')
export class W3mWalletExplorerView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private loading = !ExplorerCtrl.state.wallets.listings.length
  @state() private firstFetch = !ExplorerCtrl.state.wallets.listings.length
  @state() private endReached = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    this.createPaginationObserver()
  }

  public disconnectedCallback() {
    this.intersectionObserver?.disconnect()
  }

  // -- private ------------------------------------------------------ //
  private get loaderEl() {
    return getShadowRootElement(this, '.w3m-spinner-block')
  }

  private intersectionObserver: IntersectionObserver | undefined = undefined

  private createPaginationObserver() {
    this.intersectionObserver = new IntersectionObserver(([element]) => {
      if (element.isIntersecting) this.fetchWallets()
    })
    this.intersectionObserver.observe(this.loaderEl)
  }

  private async fetchWallets() {
    const PAGE_ENTRIES = 40
    const { listings, total } = ExplorerCtrl.state.wallets
    const { page } = ExplorerCtrl.state

    if (this.firstFetch || (total > PAGE_ENTRIES && listings.length < total))
      try {
        this.loading = true
        const { listings: newListings } = await ExplorerCtrl.getPaginatedWallets({
          page: this.firstFetch ? 1 : page + 1,
          entries: PAGE_ENTRIES,
          version: 1,
          device: CoreHelpers.isMobile() ? 'mobile' : 'desktop'
        })
        const images = newListings.map(({ image_url }) => image_url.lg)
        await Promise.all([...images.map(async url => preloadImage(url)), CoreHelpers.wait(300)])
      } catch (err) {
        ModalToastCtrl.openToast(getErrorMessage(err), 'error')
      } finally {
        this.loading = false
        this.firstFetch = false
        if (ExplorerCtrl.state.wallets.total <= PAGE_ENTRIES) this.endReached = true
      }
    else this.endReached = true
  }

  private async onConnect(links: { native: string; universal?: string }, name: string) {
    const { native, universal } = links
    await ClientCtrl.ethereum().connectLinking(uri =>
      CoreHelpers.openHref(
        universal
          ? CoreHelpers.formatUniversalUrl(universal, uri, name)
          : CoreHelpers.formatNativeUrl(native, uri, name)
      )
    )
    ConnectModalCtrl.closeModal()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { listings } = ExplorerCtrl.state.wallets
    const classes = {
      'w3m-loading': this.loading,
      'w3m-first-fetch': this.firstFetch,
      'w3m-end-reached': this.endReached
    }

    return html`
      ${dynamicStyles()}

      <w3m-modal-header title="Wallet Explorer"></w3m-modal-header>
      <w3m-modal-content class=${classMap(classes)}>
        <div class="w3m-content">
          ${listings.map(
            listing => html`
              <w3m-wallet-button
                src=${listing.image_url.lg}
                name=${listing.name}
                .onClick=${async () =>
                  CoreHelpers.isMobile()
                    ? this.onConnect(listing.mobile, listing.name)
                    : this.onConnect(listing.desktop, listing.name)}
              >
              </w3m-wallet-button>
            `
          )}
        </div>

        <div class="w3m-spinner-block">
          <w3m-spinner></w3m-spinner>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-explorer-view': W3mWalletExplorerView
  }
}
