import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html, css } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { property } from 'lit/decorators.js'

import styles from './styles.js'
import {
  AssetUtil,
  RouterController,
  AccountController,
  NetworkController,
  type CaipNetwork,
  TransactionsController
} from '@web3modal/core'
import { DateUtil } from '@web3modal/common'

@customElement('w3m-transaction-details-view')
export class W3mTransactionDetailsView extends LitElement {
  public static override styles = [
    styles,
    css`
      .flex-item {
        height: 40px; /* Set a fixed height for uniformity */
      }
      .full-width-button {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    `
  ]

  private transaction = RouterController.state.data?.transaction

  private addressExplorerUrl = AccountController.state.addressExplorerUrl // TODO: change to correct explorerUrl

  @property({ type: Boolean, attribute: false })
  private linkStatus: boolean | null = null

  override connectedCallback() {
    super.connectedCallback()
    this.getLinkStatus()
  }

  async getLinkStatus() {
    if (this.transaction) {
      const { getPeanutLinkStatus } = TransactionsController
      this.linkStatus = await getPeanutLinkStatus(this.transaction)
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const modifiedUrl =
      this.addressExplorerUrl?.replace(/\/address\/[^/]+/, '') +
      `/tx/${this.transaction?.metadata.hash}`

    return html`
      <wui-flex flexDirection="column" gap="s" .padding=${['0', 'l', 'l', 'l'] as const}>
        <wui-flex gap="xs" flexDirection="column" .padding=${['0', 'xs', '0', 'xs'] as const}>
          <wui-flex alignItems="center" justifyContent="space-between">
            <wui-flex flexDirection="column" gap="4xs">
              <wui-text variant="small-400" color="fg-150">Send</wui-text>
              <wui-text variant="paragraph-400" color="fg-100"
                >$${(
                  (this.transaction?.transfers[0]?.price ?? 0) *
                  parseFloat(this.transaction?.transfers[0]?.quantity.numeric ?? '0')
                ).toFixed(2)}</wui-text
              >
            </wui-flex>
            <wui-preview-item
              text="${this.transaction?.transfers[0]?.quantity.numeric
                ? UiHelperUtil.roundNumber(
                    parseFloat(this.transaction?.transfers[0]?.quantity.numeric),
                    6,
                    5
                  )
                : 'unknown'} ${this.transaction?.transfers[0]?.fungible_info?.symbol}"
              .imageSrc=${this.transaction?.transfers[0]?.fungible_info?.icon?.url}
            ></wui-preview-item>
          </wui-flex>
          <wui-flex>
            <wui-icon color="fg-200" size="md" name="arrowBottom"></wui-icon>
          </wui-flex>
          <wui-flex alignItems="center" justifyContent="space-between">
            <wui-text variant="small-400" color="fg-150">To</wui-text>
            <wui-flex class="generateLinkPreview"
              ><wui-icon-box
                ?border=${false}
                icon="linkConnect"
                size="s"
                backgroundColor="glass-005"
                iconColor="accent-100"
                iconSize="s"
              ></wui-icon-box
              ><wui-text
                variant="large-500"
                color="accent-100"
                class="toComponent"
                icon="linkConnect"
                >Link generated</wui-text
              ></wui-flex
            >
          </wui-flex>
        </wui-flex>
        <wui-flex flexDirection="column" gap="s" class="detailsComponent">
          ${this.templateFlexRow(
            'Price',
            `$${UiHelperUtil.roundNumber(this.transaction?.transfers[0]?.price ?? 0, 4, 2)}`
          )}
          ${this.templateFlexRow('Network', '', this.getNetworkImage())}
          ${this.templateFlexRow(
            'Date',
            DateUtil.formatDate(this.transaction?.metadata?.minedAt ?? '', 'DD MMM YYYY HH:mm')
          )}
          ${this.templateFlexRow(
            'Status',
            this.linkStatus === null ? '' : this.linkStatus ? 'Claimed' : 'Not claimed'
          )}
        </wui-flex>
        <wui-button
          size="md"
          variant="shade"
          class="full-width-button"
          @click=${() => window.open(modifiedUrl, '_blank')}
        >
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="externalLink"></wui-icon>
          explorer url
        </wui-button>
      </wui-flex>
    `
  }

  private getNetworkImage() {
    const { requestedCaipNetworks } = NetworkController.state
    return AssetUtil.getNetworkImage(
      requestedCaipNetworks?.find(
        (network: CaipNetwork) => network.id === this.transaction?.metadata.chain
      )
    )
  }

  private templateFlexRow(label: string, value: string, imageUrl?: string) {
    return html`
      <wui-flex justifyContent="space-between" alignItems="center" class="flex-item">
        <wui-text variant="paragraph-500" color="fg-200">${label}</wui-text>
        ${imageUrl
          ? html`<wui-image src=${ifDefined(imageUrl)} alt="Network"></wui-image>`
          : value == ''
            ? html`<wui-loading-spinner size="md" color="fg-150"></wui-loading-spinner>`
            : html`<wui-text variant="paragraph-400" color="fg-100">${value}</wui-text>`}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transaction-details-view': W3mTransactionDetailsView
  }
}
