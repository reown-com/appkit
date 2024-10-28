import {
  AccountController,
  ChainController,
  ConnectionController,
  ModalController,
  OptionsController,
  RouterController,
  type AccountType
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-select-addresses-view')
export class W3mSelectAddressesView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata

  @state() public allAccounts: AccountType[] = AccountController.state.allAccounts

  @state() private selectedAccounts: AccountType[] = AccountController.state.allAccounts

  @state() private selectAll = true

  @state() private approved = false

  @state() private isApproving = false

  constructor() {
    super()
    AccountController.subscribeKey('allAccounts', allAccounts => {
      this.allAccounts = allAccounts
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
    <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
      <wui-banner-img imageSrc="${ifDefined(this.metadata?.icons[0])}" text="${ifDefined(
        this.metadata?.url
      )}" size="sm"></wui-banner>
    </wui-flex>
    <wui-flex .padding=${
      ['0', 'xl', '0', 'xl'] as const
    } flexDirection="row" justifyContent="space-between">
        <wui-text variant="paragraph-400" color="fg-200">Select all</wui-text>
        <input type="checkbox" .checked=${this.selectAll}  @click=${this.onSelectAll.bind(this)} />
    </wui-flex>
      <wui-flex flexDirection="column" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        ${this.allAccounts.map(account => this.getAddressTemplate(account))}
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl'] as const} gap="s" justifyContent="space-between">
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="neutral"
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="main"
          .disabled=${this.selectedAccounts.length === 0}
          @click=${this.onContinue.bind(this)}
          ?loading=${this.isApproving}
        >
          ${this.isApproving ? 'Signing...' : 'Continue'}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private getAddressTemplate = (account: AccountType) => {
    const checked = this.selectedAccounts.some(_account => _account.address === account.address)

    return html`<wui-list-account accountAddress="${account.address}" accountType="${account.type}">
      <input
        id="${account.address}"
        slot="action"
        type="checkbox"
        .checked="${checked}"
        @change="${this.handleClick(account)}"
      />
    </wui-list-account>`
  }

  private onSelectAll = (event: Event) => {
    const checked = (event.target as HTMLInputElement).checked
    this.selectAll = this.selectedAccounts.length === this.allAccounts.length
    this.allAccounts.forEach(account => {
      this.onSelect(account, checked)
    })
  }

  private onSelect = (account: AccountType, add: boolean) => {
    if (add) {
      this.selectedAccounts.push(account)
    } else {
      this.selectedAccounts = this.selectedAccounts.filter(a => a.address !== account.address)
    }
    if (this.selectedAccounts.length > 0) {
      this.selectAll = this.selectedAccounts.length === this.allAccounts.length
    }
  }

  private handleClick(account: AccountType) {
    return (event: Event) => {
      const target = event.target as HTMLInputElement
      this.onSelect?.({ ...account }, target?.checked)
    }
  }

  private onContinue() {
    if (this.selectedAccounts.length > 0) {
      this.isApproving = true
      AccountController.setAllAccounts(this.selectedAccounts, ChainController.state.activeChain)
      AccountController.setShouldUpdateToAddress(
        this.selectedAccounts[0]?.address ?? '',
        ChainController.state.activeChain
      )
      this.approved = true
      this.isApproving = false
      ModalController.close()
    } else {
      this.onCancel()
    }
  }

  private async onCancel() {
    const { activeCaipAddress } = ChainController.state
    if (activeCaipAddress) {
      await ConnectionController.disconnect()
      ModalController.close()
    } else {
      RouterController.push('Connect')
    }
  }
  public override disconnectedCallback() {
    super.disconnectedCallback()
    if (!this.approved) {
      this.onCancel()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-addresses-view': W3mSelectAddressesView
  }
}
