import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  BlockchainApiController,
  ChainController,
  ConnectorController,
  StorageUtil
} from '@reown/appkit-controllers'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-icon-box/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import styles from './styles.js'

@customElement('wui-list-account')
export class WuiListAccount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public accountAddress = ''

  @property() public accountType = ''

  private labels = ChainController.getAccountData()?.addressLabels

  private caipNetwork = ChainController.state.activeCaipNetwork

  private socialProvider = StorageUtil.getConnectedSocialProvider()

  private balance = 0

  private fetchingBalance = true

  private shouldShowIcon = false

  @property({ type: Boolean }) public selected = false

  @property({ type: Function }) public onSelect?: (
    { address, type }: { address: string; type: string },
    selected: boolean
  ) => void

  public override connectedCallback() {
    super.connectedCallback()
    BlockchainApiController.getBalance(this.accountAddress, this.caipNetwork?.caipNetworkId)
      .then(response => {
        let total = this.balance
        if (response.balances.length > 0) {
          total = response.balances.reduce((acc, balance) => acc + (balance?.value || 0), 0)
        }
        this.balance = total
        this.fetchingBalance = false
        this.requestUpdate()
      })
      .catch(() => {
        this.fetchingBalance = false
        this.requestUpdate()
      })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const label = this.getLabel()
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)

    // Only show icon for AUTH accounts
    this.shouldShowIcon = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH

    return html`
      <wui-flex
        flexDirection="row"
        justifyContent="space-between"
        .padding=${['0', '0', '3', '2'] as const}
      >
        <wui-flex gap="l" alignItems="center">
          <wui-avatar address=${this.accountAddress}></wui-avatar>
          ${this.shouldShowIcon
            ? html`<wui-icon-box
                size="sm"
                color="default"
                icon=${this.accountType === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
                  ? (this.socialProvider ?? 'mail')
                  : 'lightbulb'}
              ></wui-icon-box>`
            : html`<wui-flex .padding="${['0', '0', '0', '2'] as const}"></wui-flex>`}
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="md-medium" color="primary"
              >${UiHelperUtil.getTruncateString({
                string: this.accountAddress,
                charsStart: 4,
                charsEnd: 6,
                truncate: 'middle'
              })}</wui-text
            >
            <wui-text class="address-description" variant="sm-regular">${label}</wui-text></wui-flex
          >
        </wui-flex>
        <wui-flex gap="3" alignItems="center">
          <slot name="action"></slot>
          ${this.fetchingBalance
            ? html`<wui-loading-spinner size="sm" color="accent-100"></wui-loading-spinner>`
            : html` <wui-text variant="sm-regular">$${this.balance.toFixed(2)}</wui-text>`}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private getLabel() {
    let label = this.labels?.get(this.accountAddress)
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)

    if (!label && connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
      label = `${this.accountType === 'eoa' ? (this.socialProvider ?? 'Email') : 'Smart'} Account`
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
