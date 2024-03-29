import {
  AccountController,
  ConnectionController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController
} from '@web3modal/core'
import { EthersStoreUtil } from '@web3modal/scaffold-utils/ethers'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-select-addresses-view')
export class W3mSelectAddressesView extends LitElement {
  public static override styles = styles
  public addresses = [
    '0xb4577ff454774F97dD6ec09f4D8dd29Be3Bd645e',
    '0xe266fA1790F09C03e4c08e07cDa97a01037D05db'
  ] as const
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata
  private selectedAddresses: string[] = []
  private selectAll = false

  @state() private isSigning = false
  constructor() {
    super()
    console.log('W3mSelectAddressesView')
  }

  onSelectAll = (event: Event) => {
    console.log('onSelectAll')
  }

  onSelect = (address: string, add: boolean) => {
    if (add) {
      this.selectedAddresses.push(address)
    } else {
      this.selectedAddresses = this.selectedAddresses.filter(a => a !== address)
    }
    console.log('selectedAddresses', this.selectedAddresses)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
        <wui-banner icon="${this.metadata?.icons[0]}" text="${this.metadata?.url}"></wui-banner>
      </wui-flex>
      <wui-flex .padding=${['0', 'xl', '0', 'xl'] as const} justifyContent="space-between">
        <wui-text variant="paragraph-400" color="fg-100">Select all</wui-text>
        
          <input type="checkbox" @click=${(event: Event) => this.onSelectAll(event)}></input>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        <wui-list-address
          address="${this.addresses[0]}"
          addressTitle="account 1"
          .selected='${this.selectedAddresses.includes(this.addresses[0])}'
          .onSelect="${(address: string, add: boolean) => this.onSelect(address, add)}"
        ></wui-list-address>
        <wui-list-address
          address="${this.addresses[1]}"
          addressTitle="account 2"
          .selected='${this.selectedAddresses.includes(this.addresses[1])}'
          .onSelect="${(address: string, add: boolean) => this.onSelect(address, add)}"
        ></wui-list-address>
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
    AccountController.setAddresses(this.selectedAddresses)
    AccountController.setShouldUpdateToAddres(this.selectedAddresses[0] ?? '')

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
