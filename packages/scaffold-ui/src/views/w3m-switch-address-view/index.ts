import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipAddress, ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  type AccountType,
  BlockchainApiController,
  ChainController,
  ConnectorController,
  ModalController,
  OptionsController
} from '@reown/appkit-core'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-avatar'
import '@reown/appkit-ui/wui-banner-img'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-switch-address-view')
export class W3mSwitchAddressView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata

  @state() public allAccounts: AccountType[] = AccountController.state.allAccounts || []

  @state() private balances: Record<string, number> = {}

  public readonly labels = AccountController.state.addressLabels

  public readonly currentAddress: string = AccountController.state.address || ''

  private caipNetwork = ChainController.state.activeCaipNetwork

  constructor() {
    super()
    AccountController.subscribeKey('allAccounts', allAccounts => {
      this.allAccounts = allAccounts
    })
  }

  public override connectedCallback() {
    super.connectedCallback()
    this.allAccounts.forEach(account => {
      BlockchainApiController.getBalance(account.address, this.caipNetwork?.caipNetworkId).then(
        response => {
          let total = this.balances[account.address] || 0
          if (response.balances.length > 0) {
            total = response.balances.reduce((acc, balance) => acc + (balance?.value || 0), 0)
          }
          this.balances[account.address] = total
          this.requestUpdate()
        }
      )
    })
  }

  public getAddressIcon(type: AccountType['type']) {
    if (type === 'smartAccount') {
      return 'lightbulb'
    }

    return 'mail'
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
        <wui-banner-img
          imageSrc=${ifDefined(this.metadata?.icons[0])}
          text=${ifDefined(this.metadata?.url)}
          size="sm"
        ></wui-banner-img>
      </wui-flex>
      <wui-flex flexDirection="column" gap="xxl" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        ${this.allAccounts.map((account, index) => this.getAddressTemplate(account, index))}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private getAddressTemplate(account: AccountType, index: number) {
    const label = this.labels?.get(account.address)
    const namespace = ChainController.state.activeChain as ChainNamespace
    const connectorId = ConnectorController.getConnectorId(namespace)
    // Only show icon for AUTH accounts
    const shouldShowIcon = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH

    return html`
      <wui-flex
        flexDirection="row"
        justifyContent="space-between"
        data-testid="switch-address-item"
      >
        <wui-flex alignItems="center">
          <wui-avatar address=${account.address}></wui-avatar>
          ${shouldShowIcon
            ? html`<wui-icon-box
                size="sm"
                iconcolor="fg-200"
                backgroundcolor="glass-002"
                background="gray"
                icon="${this.getAddressIcon(account.type)}"
                ?border=${true}
              ></wui-icon-box>`
            : html`<wui-flex .padding="${['0', '0', '0', 's'] as const}"></wui-flex>`}
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="paragraph-500" color="fg-100"
              >${label
                ? label
                : UiHelperUtil.getTruncateString({
                    string: account.address,
                    charsStart: 4,
                    charsEnd: 6,
                    truncate: 'middle'
                  })}</wui-text
            >
            <wui-text class="address-description" variant="small-400">
              ${typeof this.balances[account.address] === 'number'
                ? `$${this.balances[account.address]?.toFixed(2)}`
                : html`<wui-loading-spinner size="sm" color="accent-100"></wui-loading-spinner>`}
            </wui-text>
          </wui-flex>
        </wui-flex>
        <wui-flex gap="s" alignItems="center">
          ${account.address?.toLowerCase() === this.currentAddress?.toLowerCase()
            ? ''
            : html`
                <wui-button
                  data-testid=${`w3m-switch-address-button-${index}`}
                  textVariant="small-600"
                  size="md"
                  variant="accent"
                  @click=${() => this.onSwitchAddress(account.address)}
                  >Switch to</wui-button
                >
              `}
        </wui-flex>
      </wui-flex>
    `
  }

  private onSwitchAddress(address: string) {
    const caipNetwork = ChainController.state.activeCaipNetwork
    const activeChainNamespace = caipNetwork?.chainNamespace
    const caipAddress = `${activeChainNamespace}:${caipNetwork?.id}:${address}` as CaipAddress
    AccountController.setCaipAddress(caipAddress, activeChainNamespace)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-address-view': W3mSwitchAddressView
  }
}
