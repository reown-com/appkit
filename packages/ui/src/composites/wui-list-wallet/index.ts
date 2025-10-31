import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { ChainNamespace } from '@reown/appkit-common'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-icon-box/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IWalletImage, IconType, TagType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-all-wallets-image/index.js'
import '../wui-tag/index.js'
import '../wui-wallet-image/index.js'
import styles from './styles.js'

const NAMESPACE_ICONS = {
  eip155: 'ethereum',
  solana: 'solana',
  bip122: 'bitcoin',
  polkadot: undefined,
  cosmos: undefined,
  sui: undefined,
  stacks: undefined,
  ton: 'ton'
} as const satisfies Record<ChainNamespace, IconType | undefined>

@customElement('wui-list-wallet')
export class WuiListWallet extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages?: IWalletImage[] = []

  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public size?: 'sm' | 'md' = 'md'

  @property() public tagLabel?: string

  @property() public tagVariant?: TagType

  @property() public walletIcon?: IconType

  @property() public tabIdx?: number = undefined

  @property({ type: Array }) public namespaces?: ChainNamespace[] = []

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public showAllWallets = false

  @property({ type: Boolean }) public loading = false

  @property({ type: String }) public loadingSpinnerColor = 'accent-100'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['size'] = this.size

    return html`
      <button
        ?disabled=${this.disabled}
        data-all-wallets=${this.showAllWallets}
        tabindex=${ifDefined(this.tabIdx)}
      >
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-flex flexDirection="column" justifyContent="center" alignItems="flex-start" gap="1">
          <wui-text variant="lg-regular" color="inherit">${this.name}</wui-text>
          ${this.templateNamespaces()}
        </wui-flex>
        ${this.templateStatus()}
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateNamespaces() {
    if (this.namespaces?.length) {
      return html`<wui-flex alignItems="center" gap="0">
        ${this.namespaces.map(
          (namespace, index) =>
            html`<wui-flex
              alignItems="center"
              justifyContent="center"
              zIndex=${(this.namespaces?.length ?? 0) * 2 - index}
              class="namespace-icon"
            >
              <wui-icon
                name=${ifDefined(NAMESPACE_ICONS[namespace])}
                size="sm"
                color="default"
              ></wui-icon>
            </wui-flex>`
        )}
      </wui-flex>`
    }

    return null
  }

  private templateAllWallets() {
    if (this.showAllWallets && this.imageSrc) {
      return html` <wui-all-wallets-image .imageeSrc=${this.imageSrc}> </wui-all-wallets-image> `
    } else if (this.showAllWallets && this.walletIcon) {
      return html` <wui-wallet-image .walletIcon=${this.walletIcon} size="sm"> </wui-wallet-image> `
    }

    return null
  }

  private templateWalletImage() {
    if (!this.showAllWallets && this.imageSrc) {
      return html`<wui-wallet-image
        size=${ifDefined(this.size === 'sm' ? 'sm' : 'md')}
        imageSrc=${this.imageSrc}
        name=${this.name}
      ></wui-wallet-image>`
    } else if (!this.showAllWallets && !this.imageSrc) {
      return html`<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`
    }

    return null
  }

  private templateStatus() {
    if (this.loading) {
      return html`<wui-loading-spinner size="lg" color="accent-primary"></wui-loading-spinner>`
    } else if (this.tagLabel && this.tagVariant) {
      return html`<wui-tag size="sm" variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-wallet': WuiListWallet
  }
}
