import type { Listing } from '@web3modal/core'
import { CoreUtil, ExplorerCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { TemplateUtil } from '../../utils/TemplateUtil'
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
    const { wallets, search, injectedWallets } = ExplorerCtrl.state
    const { listings, total, page } = this.search ? search : wallets

    if (
      !this.endReached &&
      (this.firstFetch || (total > PAGE_ENTRIES && listings.length < total))
    ) {
      try {
        this.loading = true
        const { listings: newListings } = await ExplorerCtrl.getWallets({
          page: this.firstFetch ? 1 : page + 1,
          entries: PAGE_ENTRIES,
          search: this.search,
          version: 2
        })
        const explorerImages = newListings.map(wallet => UiUtil.getWalletIcon(wallet))
        const extensionImages = injectedWallets.map(wallet => UiUtil.getWalletIcon(wallet))
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

  private onConnect(listing: Listing) {
    if (CoreUtil.isAndroid()) {
      UiUtil.handleMobileLinking(listing)
    } else {
      UiUtil.goToConnectingView(listing)
    }
  }

  private onSearchChange(event: Event) {
    const { value } = event.target as HTMLInputElement
    this.searchDebounce(value)
  }

  private readonly searchDebounce = UiUtil.debounce((value: string) => {
    if (value.length >= 1) {
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
    const { listings } = this.search ? search : wallets
    const isLoading = this.loading && !listings.length
    const isSearch = this.search.length >= 3
    let extensions = TemplateUtil.injectedWalletsTemplate()
    let manualWallets = TemplateUtil.manualWalletsTemplate()
    let recomendedWallets = TemplateUtil.recomendedWalletsTemplate(true)

    // If search is active, we only show results matching query
    if (isSearch) {
      extensions = extensions.filter(({ values }) =>
        UiUtil.caseSafeIncludes(values[0] as string, this.search)
      )
      manualWallets = manualWallets.filter(({ values }) =>
        UiUtil.caseSafeIncludes(values[0] as string, this.search)
      )
      recomendedWallets = recomendedWallets.filter(({ values }) =>
        UiUtil.caseSafeIncludes(values[0] as string, this.search)
      )
    }

    // Deduplicate extension wallets from recomended wallets
    extensions = extensions.filter(
      ext =>
        !recomendedWallets.find(rcm =>
          UiUtil.caseSafeIncludes(ext.values[0] as string, rcm.values[0] as string)
        )
    )

    const isEmpty =
      !this.loading && !listings.length && !extensions.length && !recomendedWallets.length
    const iterator = Math.max(extensions.length, listings.length)
    const classes = {
      'w3m-loading': isLoading,
      'w3m-end-reached': this.endReached || !this.loading,
      'w3m-empty': isEmpty
    }

    return html`
      <w3m-modal-header data-testid="view-wallet-explorer-header">
        <w3m-search-input .onChange=${this.onSearchChange.bind(this)}></w3m-search-input>
      </w3m-modal-header>

      <w3m-modal-content class=${classMap(classes)} data-testid="view-wallet-explorer-content">
        <div class="w3m-grid">
          ${isLoading ? null : recomendedWallets}
          ${isLoading
            ? null
            : [...Array(iterator)].map(
                (_, index) => html`
                  ${manualWallets[index]} ${extensions[index]}
                  ${listings[index]
                    ? html`
                        <w3m-wallet-button
                          imageId=${listings[index].image_id}
                          name=${listings[index].name}
                          walletId=${listings[index].id}
                          .onClick=${() => this.onConnect(listings[index])}
                          data-testid="view-wallet-explorer-button-${listings[index].id}"
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
