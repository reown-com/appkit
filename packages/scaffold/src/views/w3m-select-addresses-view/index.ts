/* eslint-disable no-console */
import {
  AccountController,
  ConnectionController,
  ModalController,
  OptionsController,
  RouterController,
  type AccountType
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-select-addresses-view')
export class W3mSelectAddressesView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata
  public readonly allAccounts: AccountType[] = AccountController.state.allAccounts
  private selectedAccounts: AccountType[] = []
  // Private selectAll = false

  @state() private isSigning = false
  constructor() {
    super()
    console.log('W3mSelectAddressesView')
    console.log('metadata', this.metadata)
    console.log('selectedAccounts', this.selectedAccounts)
  }

  onSelectAll = (event: Event) => {
    console.log('onSelectAll', event)
  }

  onSelect = (account: AccountType, add: boolean) => {
    if (add) {
      this.selectedAccounts.push(account)
    } else {
      this.selectedAccounts = this.selectedAccounts.filter(a => a.address !== account.address)
    }
    console.log('selectedAccounts', this.selectedAccounts)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
        <wui-banner icon="${this.metadata?.icons[0]}" text="${this.metadata?.url}"></wui-banner>
      </wui-flex>
      <wui-flex .padding=${['0', 'xl', '0', 'xl'] as const} justifyContent="space-between">
        <wui-text variant="paragraph-400" color="fg-base-200">Select all</wui-text>
        
          <input type="checkbox" @click=${(event: Event) => this.onSelectAll(event)}></input>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        ${this.allAccounts.map(account => {
          return html` <wui-list-account
            accountAddress="${account.address}"
            accountType="${account.type}"
            .selected="${this.selectedAccounts.includes(account)}"
            @onSelect="${(selectedAccount: AccountType, add: boolean) =>
              this.onSelect(selectedAccount, add)}"
          ></wui-list-account>`
        })}
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl'] as const} gap="s" justifyContent="space-between">
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="shade"
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="fill"
          @click=${this.onContinue.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning ? 'Signing...' : 'Continue'}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private async onContinue() {
    this.isSigning = true
    await new Promise(resolve => setTimeout(resolve, 2000))
    AccountController.setAllAccounts(this.selectedAccounts)
    AccountController.setShouldUpdateToAddress(this.selectedAccounts[0]?.address ?? '')
    this.isSigning = false
    ModalController.close()
  }

  private async onCancel() {
    const { isConnected } = AccountController.state
    if (isConnected) {
      await ConnectionController.disconnect()
      ModalController.close()
    } else {
      RouterController.push('Connect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-addresses-view': W3mSelectAddressesView
  }
}
