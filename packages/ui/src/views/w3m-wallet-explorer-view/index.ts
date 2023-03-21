import type { InstallConnectorData, Listing, MobileWallet } from '@web3modal/core'
import { CoreUtil, ExplorerCtrl, OptionsCtrl, RouterCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { DataFilterUtil } from '../../utils/DataFilterUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

const PAGE_ENTRIES = 40

@customElement('w3m-wallet-explorer-view')
export class W3mWalletExplorerView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private loading = !ExplorerCtrl.state.wallets.listings.length
  @state() private firstFetch = !ExplorerCtrl.state.wallets.listings.length
  @state() private search = ''
  @state() private endReached = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    this.createPaginationObserver()
  }

  public disconnectedCallback() {
    this.intersectionObserver?.disconnect()
  }

  // -- private ------------------------------------------------------ //
  private get placeholderEl() {
    return UiUtil.getShadowRootElement(this, '.w3m-placeholder-block')
  }

  private intersectionObserver: IntersectionObserver | undefined = undefined

  private createPaginationObserver() {
    this.intersectionObserver = new IntersectionObserver(([element]) => {
      if (element.isIntersecting && !(this.search && this.firstFetch)) {
        this.fetchWallets()
      }
    })
    this.intersectionObserver.observe(this.placeholderEl)
  }

  private isLastPage() {
    const { wallets, search } = ExplorerCtrl.state
    const { listings, total } = this.search ? search : wallets

    return total <= PAGE_ENTRIES || listings.length >= total
  }

  private async fetchWallets() {
    const { wallets, search } = ExplorerCtrl.state
    const extensionWallets = UiUtil.getExtensionWallets()
    const { listings, total, page } = this.search ? search : wallets

    if (
      !this.endReached &&
      (this.firstFetch || (total > PAGE_ENTRIES && listings.length < total))
    ) {
      try {
        this.loading = true
        const chains = OptionsCtrl.state.standaloneChains?.join(',')
        const { listings: newListings } = await ExplorerCtrl.getPaginatedWallets({
          page: this.firstFetch ? 1 : page + 1,
          entries: PAGE_ENTRIES,
          search: this.search,
          version: OptionsCtrl.state.walletConnectVersion,
          chains
        })
        const explorerImages = newListings.map(wallet => UiUtil.getWalletIcon(wallet))
        const extensionImages = extensionWallets.map(({ id }) => UiUtil.getWalletIcon({ id }))
        await Promise.all([
          ...explorerImages.map(async url => UiUtil.preloadImage(url)),
          ...extensionImages.map(async url => UiUtil.preloadImage(url)),
          CoreUtil.wait(300)
        ])
        this.endReached = this.isLastPage()
      } catch (err) {
        console.error(err)
        ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      } finally {
        this.loading = false
        this.firstFetch = false
      }
    }
  }

  private onConnectCustom({ name, id, links }: MobileWallet) {
    if (CoreUtil.isMobile()) {
      UiUtil.handleMobileLinking({ links, name, id })
    } else {
      RouterCtrl.push('DesktopConnector', {
        DesktopConnector: { name, walletId: id, universal: links.universal, native: links.native }
      })
    }
  }

  private onConnectListing(listing: Listing) {
    if (CoreUtil.isMobile()) {
      const { id } = listing
      const { native, universal } = listing.mobile
      UiUtil.handleMobileLinking({
        links: { native, universal },
        name: listing.name,
        id,
        image: UiUtil.getWalletIcon(listing)
      })
    } else {
      RouterCtrl.push('DesktopConnector', {
        DesktopConnector: {
          name: listing.name,
          icon: UiUtil.getWalletIcon(listing),
          universal: listing.desktop.universal || listing.homepage,
          native: listing.desktop.native
        }
      })
    }
  }

  private onConnectExtension(data: InstallConnectorData) {
    const injectedId = UiUtil.getWalletId('')
    if (injectedId === data.id) {
      RouterCtrl.push('InjectedConnector')
    } else {
      RouterCtrl.push('InstallConnector', { InstallConnector: data })
    }
  }

  private onSearchChange(event: Event) {
    const { value } = event.target as HTMLInputElement
    this.searchDebounce(value)
  }

  private readonly searchDebounce = UiUtil.debounce((value: string) => {
    if (value.length >= 3) {
      this.firstFetch = true
      this.endReached = false
      this.search = value
      ExplorerCtrl.resetSearch()
      this.fetchWallets()
    } else if (this.search) {
      this.search = ''
      this.endReached = this.isLastPage()
      ExplorerCtrl.resetSearch()
    }
  })

  // -- render ------------------------------------------------------- //
  protected render() {
    const { wallets, search } = ExplorerCtrl.state
    const { isStandalone } = OptionsCtrl.state
    let { listings } = this.search ? search : wallets
    listings = DataFilterUtil.allowedExplorerListings(listings)
    const isLoading = this.loading && !listings.length
    const isSearch = this.search.length >= 3
    const isExtensions = !isStandalone && !CoreUtil.isMobile()
    let extensions = isExtensions ? UiUtil.getExtensionWallets() : []
    let customWallets = UiUtil.getCustomWallets()

    if (isSearch) {
      extensions = extensions.filter(({ name }) => UiUtil.caseSafeIncludes(name, this.search))
      customWallets = customWallets.filter(({ name }) => UiUtil.caseSafeIncludes(name, this.search))
    }

    const isEmpty = !this.loading && !listings.length && !extensions.length
    const iterator = Math.max(extensions.length, listings.length)
    const classes = {
      'w3m-loading': isLoading,
      'w3m-end-reached': this.endReached || !this.loading,
      'w3m-empty': isEmpty
    }

    return html`
      <w3m-modal-header>
        <w3m-search-input .onChange=${this.onSearchChange.bind(this)}></w3m-search-input>
      </w3m-modal-header>

      <w3m-modal-content class=${classMap(classes)}>
        <div class="w3m-grid">
          ${isLoading
            ? null
            : [...Array(iterator)].map(
                (_, index) => html`
                  ${customWallets[index]
                    ? html`
                        <w3m-wallet-button
                          name=${customWallets[index].name}
                          walletId=${customWallets[index].id}
                          .onClick=${() => this.onConnectCustom(customWallets[index])}
                        >
                        </w3m-wallet-button>
                      `
                    : null}
                  ${extensions[index]
                    ? html`
                        <w3m-wallet-button
                          name=${extensions[index].name}
                          walletId=${extensions[index].id}
                          .onClick=${() => this.onConnectExtension(extensions[index])}
                        >
                        </w3m-wallet-button>
                      `
                    : null}
                  ${listings[index]
                    ? html`
                        <w3m-wallet-button
                          src=${UiUtil.getWalletIcon(listings[index])}
                          name=${listings[index].name}
                          walletId=${listings[index].id}
                          .onClick=${() => this.onConnectListing(listings[index])}
                        >
                        </w3m-wallet-button>
                      `
                    : null}
                `
              )}
        </div>
        <div class="w3m-placeholder-block">
          ${isEmpty
            ? html`<w3m-text variant="big-bold" color="secondary">No results found</w3m-text>`
            : null}
          ${!isEmpty && this.loading ? html`<w3m-spinner></w3m-spinner>` : null}
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
