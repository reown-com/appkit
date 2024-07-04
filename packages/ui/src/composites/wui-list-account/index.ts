import { html, LitElement } from 'lit'
import { state } from 'lit/decorators.js'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { W3mFrameRpcConstants } from '@web3modal/wallet'
import {
  AccountController,
  BlockchainApiController,
  NetworkController,
  StorageUtil
} from '@web3modal/core'

@customElement('wui-list-account')
export class WuiListAccount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public accountAddress = ''

  @property() public accountType = ''

  private connectedConnector = StorageUtil.getConnectedConnector()

  private labels = AccountController.state.addressLabels

  private caipNetwork = NetworkController.state.caipNetwork

  @state() private balance = 0

  @state() private fetchingBalance = true

  private shouldShowIcon = false

  @property({ type: Boolean }) public selected = false

  @property({ type: Function }) public onSelect?: (
    { address, type }: { address: string; type: string },
    selected: boolean
  ) => void

  public override connectedCallback() {
    super.connectedCallback()
    BlockchainApiController.getBalance(this.accountAddress, this.caipNetwork?.id).then(response => {
      let total = this.balance
      if (response.balances.length > 0) {
        total = response.balances.reduce((acc, balance) => acc + (balance?.value || 0), 0)
      }
      this.balance = total
      this.fetchingBalance = false
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const label = this.getLabel()
    // Only show icon for AUTH accounts
    this.shouldShowIcon = this.connectedConnector === 'AUTH'

    return html`
      <wui-flex
        flexDirection="row"
        justifyContent="space-between"
        .padding=${['0', '0', 's', '1xs'] as const}
      >
        <wui-flex gap="md" alignItems="center">
          <wui-avatar address=${this.accountAddress}></wui-avatar>
          ${this.shouldShowIcon
            ? html`<wui-icon-box
                size="sm"
                iconcolor="fg-200"
                backgroundcolor="fg-300"
                icon=${this.accountType === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
                  ? 'mail'
                  : 'lightbulb'}
                background="fg-300"
              ></wui-icon-box>`
            : html`<wui-flex .padding="${['0', '0', '0', 's'] as const}"></wui-flex>`}
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="paragraph-500" color="fg-100"
              >${UiHelperUtil.getTruncateString({
                string: this.accountAddress,
                charsStart: 4,
                charsEnd: 6,
                truncate: 'middle'
              })}</wui-text
            >
            <wui-text class="address-description" variant="small-400">${label}</wui-text></wui-flex
          >
        </wui-flex>
        <wui-flex gap="s" alignItems="center">
          ${this.fetchingBalance
            ? html`<wui-loading-spinner size="sm" color="accent-100"></wui-loading-spinner>`
            : html` <wui-text variant="small-400">$${this.balance.toFixed(2)}</wui-text>`}
          <slot name="action"></slot>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private getLabel() {
    let label = this.labels?.get(this.accountAddress)

    // If there is no provided label, set one depending on the account type
    if (!label && this.connectedConnector === 'AUTH') {
      label = `${this.accountType === 'eoa' ? 'Email' : 'Smart'} Account`
    } else if (
      (!label && this.connectedConnector === 'INJECTED') ||
      this.connectedConnector === 'ANNOUNCED'
    ) {
      label = `Injected Account`
    } else if (!label) {
      label = 'EOA'
    }

    return label
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-account': WuiListAccount
  }
}
