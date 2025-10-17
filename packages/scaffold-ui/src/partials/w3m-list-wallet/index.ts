import { LitElement, type PropertyValues, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { ChainNamespace } from '@reown/appkit-common'
import { AdapterController, EventsController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import type { IWalletImage, IconType, TagType } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-wallet'

import styles from './styles.js'

@customElement('w3m-list-wallet')
export class W3mListWallet extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private intersectionObserver?: IntersectionObserver

  private hasImpressionSent = false

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages?: IWalletImage[] = []

  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public size?: 'sm' | 'md' = 'md'

  @property() public tagLabel?: string

  @property() public tagVariant?: TagType

  @property() public walletIcon?: IconType

  @property() public tabIdx?: number = undefined

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public showAllWallets = false

  @property({ type: Boolean }) public loading = false

  @property({ type: String }) public loadingSpinnerColor = 'accent-100'

  @property() public rdnsId?: string = ''

  @property() public displayIndex?: number = undefined

  @property() public walletRank?: number = undefined

  @property({ type: Array }) public namespaces?: ChainNamespace[] = []

  // -- Lifecycle ------------------------------------------- //
  public override connectedCallback() {
    super.connectedCallback()
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanupIntersectionObserver()
  }

  public override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties)

    // Reset impression tracking when wallet changes
    if (
      changedProperties.has('name') ||
      changedProperties.has('imageSrc') ||
      changedProperties.has('walletRank')
    ) {
      this.hasImpressionSent = false
    }

    const hasWalletRankChanged = changedProperties.has('walletRank') && this.walletRank

    // Check if loading state changed and we're visible
    if (hasWalletRankChanged && !this.intersectionObserver) {
      this.setupIntersectionObserver()
    }
  }

  // -- Private ------------------------------------------- //
  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.loading && !this.hasImpressionSent) {
            this.sendImpressionEvent()
          }
        })
      },
      { threshold: 0.1 }
    )

    this.intersectionObserver.observe(this)
  }

  private cleanupIntersectionObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = undefined
    }
  }

  private sendImpressionEvent() {
    if (!this.name || this.hasImpressionSent || !this.walletRank) {
      return
    }

    this.hasImpressionSent = true
    if (this.rdnsId || this.name) {
      EventsController.sendWalletImpressionEvent({
        name: this.name,
        walletRank: this.walletRank,
        rdnsId: this.rdnsId,
        view: RouterController.state.view,
        displayIndex: this.displayIndex
      })
    }
  }

  private handleGetWalletNamespaces() {
    const isMultiChain = Object.keys(AdapterController.state.adapters).length > 1

    if (isMultiChain) {
      return this.namespaces
    }

    return []
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${ifDefined(this.imageSrc)}
        name=${this.name}
        size=${ifDefined(this.size)}
        tagLabel=${ifDefined(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-list-wallet': W3mListWallet
  }
}
