import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConnectionController, RouterController, SnackController } from '@reown/appkit-core'
import { MathUtil, UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-active-profile-wallet-item'
import '@reown/appkit-ui/wui-balance'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-inactive-profile-wallet-item'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-text'

import { MOCK_ACTIVE_CONNECTIONS, MOCK_ACTIVE_WALLETS, MOCK_INACTIVE_WALLETS } from './mocks.js'
import styles from './styles.js'

const SMART_SESSION_TABS = [
  { icon: 'ethereum-black', label: 'EVM' },
  { icon: 'solana-black', label: 'Solana' },
  { icon: 'bitcoin-black', label: 'Bitcoin' }
]

const MOCK_AMOUNT = 3043.62

const address = '0xDBbD65026a07cFbFa1aa92744E4D69951686077d'

@customElement('w3m-profile-wallets-view')
export class W3mProfileWalletsView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private resizeObserver?: ResizeObserver

  // -- State & Properties --------------------------------- //
  @state() private currentTab = 0

  public constructor() {
    super()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.disconnect()
    const connectEl = this.shadowRoot?.querySelector('.wallet-list')
    connectEl?.removeEventListener('scroll', this.handleConnectListScroll.bind(this))
  }

  public override firstUpdated() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list')

    if (walletListEl) {
      // Use requestAnimationFrame to access scroll properties before the next repaint
      requestAnimationFrame(this.handleConnectListScroll.bind(this))
      walletListEl?.addEventListener('scroll', this.handleConnectListScroll.bind(this))
      this.resizeObserver = new ResizeObserver(() => {
        this.handleConnectListScroll()
      })
      this.resizeObserver.observe(walletListEl)
      this.handleConnectListScroll()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', 'l', 'l'] as const} gap="xxl">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private topTemplate() {
    return html`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-text color="fg-200" variant="paragraph-400">Total Balance</wui-text>
        <wui-balance pennies="72" dollars="6,938"></wui-balance>
        <wui-link>Across 10 Wallets</wui-link>
      </wui-flex>
    `
  }

  private bottomTemplate() {
    const hideWalletList = false

    return html`
      <wui-flex flexDirection="column" rowGap="l">
        <wui-tabs
          .onTabChange=${this.onTabChange.bind(this)}
          .activeTab=${this.currentTab}
          localTabWidth="109px"
          .tabs=${SMART_SESSION_TABS}
        ></wui-tabs>
        ${this.balanceTemplate()}
        <wui-flex flexDirection="column" rowGap="l">
          ${hideWalletList ? this.emptyTemplate() : this.walletListTemplate()}
          ${this.addWalletTemplate()}
        </wui-flex>
      </wui-flex>
    `
  }

  private balanceTemplate() {
    return html`
      <wui-flex alignItems="center" columnGap="xxs">
        <wui-icon name="ethereum-black" size="md"></wui-icon>
        <wui-text color="fg-200" variant="small-400">Balance</wui-text>
        <wui-text color="fg-100" variant="small-400" class="balance-amount">
          ${UiHelperUtil.formatCurrency(MOCK_AMOUNT, { currency: 'USD' })}
        </wui-text>
        <wui-link>Disconnect All</wui-link>
      </wui-flex>
    `
  }

  private walletListTemplate() {
    return html`
      <wui-flex flexDirection="column" class="wallet-list" rowGap="xs">
        ${this.activeWalletsTemplate()} ${this.inactiveWalletsTemplate()}
      </wui-flex>
    `
  }

  private activeWalletsTemplate() {
    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['l', 'l', 'xs', 'l'] as const}
        class="active-wallets"
      >
        ${MOCK_ACTIVE_WALLETS.map(
          w => html`
            <wui-active-profile-wallet-item
              address=${address}
              alt=${w.alt}
              amount=${w.amount}
              currency=${w.currency}
              tagLabel=${w.tagLabel}
              tagVariant=${w.tagVariant}
              imageSrc=${w.imageSrc}
              totalNetworks=${w.totalNetworks}
              .loading=${false}
              @copy=${this.handleCopyAddress.bind(this)}
              @disconnect=${this.handleDisconnect.bind(this)}
            ></wui-active-profile-wallet-item>
          `
        )}

        <wui-separator></wui-separator>

        ${MOCK_ACTIVE_CONNECTIONS.map(
          w => html`
            <wui-inactive-profile-wallet-item
              address=${address}
              alt=${w.alt}
              amount=${w.amount}
              currency=${w.currency}
              buttonLabel=${w.buttonLabel}
              buttonVariant=${w.buttonVariant}
              imageSrc=${w.imageSrc}
              totalNetworks=${w.totalNetworks}
              .loading=${false}
            ></wui-inactive-profile-wallet-item>
          `
        )}
      </wui-flex>
    `
  }

  private inactiveWalletsTemplate() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 'l', '0', 'l'] as const} rowGap="xs">
        <wui-text color="fg-200" variant="micro-500">RECENTLY CONNECTED</wui-text>

        <wui-flex flexDirection="column">
          ${MOCK_INACTIVE_WALLETS.map(
            (w, idx) => html`
              <wui-flex flexDirection="column">
                <wui-inactive-profile-wallet-item
                  address=${address}
                  alt=${w.alt}
                  amount=${w.amount}
                  currency=${w.currency}
                  buttonLabel=${w.buttonLabel}
                  buttonVariant=${w.buttonVariant}
                  imageSrc=${w.imageSrc}
                  totalNetworks=${w.totalNetworks}
                  .loading=${false}
                  .showBalance=${false}
                ></wui-inactive-profile-wallet-item>

                ${idx < MOCK_INACTIVE_WALLETS.length - 1
                  ? html`<wui-separator></wui-separator>`
                  : null}
              </wui-flex>
            `
          )}
        </wui-flex>
      </wui-flex>
    `
  }

  private emptyTemplate() {
    return html`
      <wui-flex alignItems="flex-start" class="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowGap="s"
          class="empty-box"
        >
          <wui-icon-box
            size="lg"
            icon="wallet"
            background="gray"
            iconColor="fg-200"
            backgroundColor="glass-002"
          ></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="3xs">
            <wui-text color="fg-100" variant="paragraph-500">No wallet connected</wui-text>
            <wui-text color="fg-200" variant="tiny-500">Add your first Bitcoin wallet.</wui-text>
          </wui-flex>

          <wui-button variant="neutral" size="md">
            <wui-icon color="inherit" slot="iconLeft" name="plus"></wui-icon>
            Add Bitcoin Wallet
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private addWalletTemplate() {
    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${true}
        @click=${this.handleAddWallet.bind(this)}
      >
        <wui-text variant="paragraph-500" color="fg-200">Add EVM Wallet</wui-text>
      </wui-list-item>
    `
  }

  private handleAddWallet() {
    RouterController.push('Connect')
  }

  private handleCopyAddress() {
    SnackController.showSuccess('Copied')
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private async handleDisconnect() {
    await ConnectionController.disconnect()
  }

  private onTabChange(index: number) {
    this.currentTab = index
  }

  private handleConnectListScroll() {
    const walletListEl = this.shadowRoot?.querySelector('.wallet-list') as HTMLElement | undefined

    if (!walletListEl) {
      return
    }

    walletListEl.style.setProperty(
      '--connect-scroll--top-opacity',
      MathUtil.interpolate([0, 50], [0, 1], walletListEl.scrollTop).toString()
    )
    walletListEl.style.setProperty(
      '--connect-scroll--bottom-opacity',
      MathUtil.interpolate(
        [0, 50],
        [0, 1],
        walletListEl.scrollHeight - walletListEl.scrollTop - walletListEl.offsetHeight
      ).toString()
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-profile-wallets-view': W3mProfileWalletsView
  }
}
