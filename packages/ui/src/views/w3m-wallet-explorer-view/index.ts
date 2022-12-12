import type { Listing } from '@web3modal/core'
import {
  ClientCtrl,
  CoreUtil,
  ExplorerCtrl,
  OptionsCtrl,
  RouterCtrl,
  ToastCtrl
} from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
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
          device: CoreUtil.isMobile() ? 'mobile' : 'desktop',
          search: this.search,
          chains
        })
        const explorerImages = newListings.map(({ image_url }) => image_url.lg)
        const extensionImages = extensionWallets.map(({ id }) => UiUtil.getWalletIcon(id))
        await Promise.all([
          ...explorerImages.map(async url => UiUtil.preloadImage(url)),
          ...extensionImages.map(async url => UiUtil.preloadImage(url)),
          CoreUtil.wait(300)
        ])
        this.endReached = this.isLastPage()
      } catch (err) {
        ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
      } finally {
        this.loading = false
        this.firstFetch = false
      }
    }
  }

  private async onConnectPlatform(listing: Listing) {
    if (CoreUtil.isMobile()) {
      const { id, image_url } = listing
      const { native, universal } = listing.mobile
      await UiUtil.handleMobileLinking({
        links: { native, universal },
        name: listing.name,
        id,
        image: image_url.lg
      })
    } else {
      RouterCtrl.push('DesktopConnector', {
        DesktopConnector: {
          name: listing.name,
          icon: listing.image_url.lg,
          universal: listing.desktop.universal || listing.homepage,
          native: listing.desktop.native
        }
      })
    }
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

  private onSearchChange(event: Event) {
    const { value } = event.target as HTMLInputElement
    this.searchDebounce(value)
  }

  private onCoinbaseWallet() {
    if (CoreUtil.isCoinbaseExtension()) {
      RouterCtrl.push('CoinbaseExtensionConnector')
    } else {
      RouterCtrl.push('CoinbaseMobileConnector')
    }
  }

  private coinbaseConnectorTemplate() {
    try {
      const connector = ClientCtrl.client().getConnectorById('coinbaseWallet')

      return html`
        <w3m-wallet-button
          name=${connector.name}
          walletId=${connector.id}
          .onClick=${() => this.onCoinbaseWallet()}
        ></w3m-wallet-button>
      `
    } catch {
      return null
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { wallets, search } = ExplorerCtrl.state
    const { listings } = this.search ? search : wallets
    const isLoading = this.loading && !listings.length
    const isSearch = this.search.length >= 3
    const isCoinbase = !isLoading && !isSearch
    let extensions = CoreUtil.isMobile() ? [] : UiUtil.getExtensionWallets()

    if (isSearch) {
      extensions = extensions.filter(({ name }) =>
        name?.toUpperCase().includes(this.search.toUpperCase())
      )
    }

    const isEmpty = !this.loading && !listings.length && !extensions.length
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
            : extensions.map(
                extension => html`
                  <w3m-wallet-button
                    name=${extension.name ?? ''}
                    walletId=${extension.id}
                    .onClick=${async () => this.onConnectPlatform(extension)}
                  >
                  </w3m-wallet-button>
                `
              )}
          ${isCoinbase ? this.coinbaseConnectorTemplate() : null}
          ${listings.map(
            listing => html`
              <w3m-wallet-button
                src=${listing.image_url.lg}
                name=${listing.name}
                walletId=${listing.id}
                .onClick=${async () => this.onConnectPlatform(listing)}
              >
              </w3m-wallet-button>
            `
          )}
        </div>
        <div class="w3m-placeholder-block">
          ${isEmpty
            ? html`<w3m-text variant="large-bold" color="secondary">No results found</w3m-text>`
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
