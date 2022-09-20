import {
  ClientCtrl,
  ConnectModalCtrl,
  CoreHelpers,
  ExplorerCtrl,
  ModalToastCtrl
} from '@web3modal/core'
import type { ListingResponse } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../components/w3m-spinner'
import '../../components/w3m-text'
import '../../components/w3m-wallet-button'
import { SEARCH_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import {
  debounce,
  getErrorMessage,
  getShadowRootElement,
  preloadImage
} from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

const PAGE_ENTRIES = 40

@customElement('w3m-wallet-explorer-view')
export class W3mWalletExplorerView extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private firstFetch = true
  @state() private search = ''
  @state() private endReached = false
  @state() private listingResponse: ListingResponse = { listings: [], total: 0 }
  @state() private unsubscribeWallets: (() => void) | undefined = undefined
  @state() private isLoading = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    this.createPaginationObserver()
    this.unsubscribeWallets = ExplorerCtrl.subscribe(explorerState => {
      if (!explorerState.isLoading) this.listingResponse = explorerState.wallets
      this.isLoading = explorerState.isLoading
      this.search = explorerState.search
    })
  }

  public disconnectedCallback() {
    this.intersectionObserver?.disconnect()
    this.unsubscribeWallets?.()
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

  /*
   * Can not reference `this.fetchWallets` here as `this` would break inside
   * the debounce callback. So, a smaller callback function is used.
   */
  private readonly searchDebounced = debounce(async (search: string) => {
    const { page } = ExplorerCtrl.state

    const { total: newTotal } = await ExplorerCtrl.getPaginatedWallets(
      {
        page,
        entries: PAGE_ENTRIES,
        search: search.length > 2 ? search : '',
        version: 1,
        device: CoreHelpers.isMobile() ? 'mobile' : 'desktop'
      },
      false
    )
    if (newTotal <= PAGE_ENTRIES) this.endReached = true
  }, 500)

  private onSearch(ev: Event) {
    const search = (ev.currentTarget as HTMLInputElement).value
    this.search = search
    this.searchDebounced(search)
  }

  private searchTemplate() {
    return html`<span class="w3m-explorer-search">
      ${SEARCH_ICON}
      <input placeholder="Search" @input="${this.onSearch}" id="explorer-search" type="search" />
    </span>`
  }

  private loadingTemplate() {
    return html`
      <div class="w3m-centered-block">
        <w3m-spinner></w3m-spinner>
      </div>
    `
  }

  private async fetchWallets() {
    const { listings, total } = this.listingResponse
    const { page } = ExplorerCtrl.state

    if (this.isLoading) return

    if (this.firstFetch || (total > PAGE_ENTRIES && listings.length < total))
      try {
        const { listings: newListings, total: newTotal } = await ExplorerCtrl.getPaginatedWallets(
          {
            page: this.firstFetch ? 1 : page + 1,
            entries: PAGE_ENTRIES,
            search: this.search,
            version: 1,
            device: CoreHelpers.isMobile() ? 'mobile' : 'desktop'
          },
          !this.firstFetch
        )

        if (newTotal <= PAGE_ENTRIES) this.endReached = true
        const images = newListings.map(({ image_url }) => image_url.lg)
        await Promise.all([...images.map(async url => preloadImage(url)), CoreHelpers.wait(300)])
      } catch (err) {
        ModalToastCtrl.openToast(getErrorMessage(err), 'error')
      } finally {
        this.firstFetch = false
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
    const { listings } = this.listingResponse
    const classes = {
      'w3m-loading': this.isLoading,
      'w3m-first-fetch': this.firstFetch,
      'w3m-end-reached': this.endReached
    }

    return html`
      ${dynamicStyles()}

      <w3m-modal-header>${this.searchTemplate()}</w3m-modal-header>

      <w3m-modal-content class=${classMap(classes)}>
        ${this.isLoading && this.endReached && !this.firstFetch
          ? this.loadingTemplate()
          : html`
              ${listings.length > 0 && !this.isLoading
                ? html`
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
                  `
                : html`
                    <div class="w3m-centered-block">
                      <w3m-text align="center" color="secondary">No Results Found</w3m-text>
                    </div>
                  `}
            `}
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
