import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  type TransferStatus,
  TransfersController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

type TransferStatusType = 'pending' | 'success' | 'error'

@customElement('w3m-transfers-confirmation-view')
export class W3mTransfersConfirmationView extends LitElement {
  public static override styles = styles

  private unsubscribe: (() => void)[] = []

  private pollingInterval?: ReturnType<typeof setInterval>

  private pollingAttempts = 0

  private maxPollingAttempts = 60

  @state() private quote = TransfersController.state.quote

  @state() private transferStatus?: TransferStatus

  @state() private statusType: TransferStatusType = 'pending'

  @state() private errorMessage?: string

  public constructor() {
    super()

    this.unsubscribe.push(
      TransfersController.subscribe(newState => {
        this.quote = newState.quote
        this.transferStatus = newState.transferStatus
      })
    )
  }

  public override async firstUpdated() {
    if (this.quote?.requestId) {
      this.startPolling()
    } else {
      this.statusType = 'error'
      this.errorMessage = 'No request ID found'
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.stopPolling()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${['1', '3', '4', '3'] as const}
      >
        ${this.templateStatusIcon()} ${this.templateContent()}
      </wui-flex>
    `
  }

  private templateStatusIcon() {
    if (this.statusType === 'pending') {
      return html`
        <wui-flex justifyContent="center" alignItems="center" class="icon-box pending">
          <wui-loading-spinner size="xl" color="accent-100"></wui-loading-spinner>
        </wui-flex>
      `
    }

    if (this.statusType === 'success') {
      return html`
        <wui-flex justifyContent="center" alignItems="center" class="icon-box success">
          <wui-icon size="xxl" color="success" name="checkmark"></wui-icon>
        </wui-flex>
      `
    }

    return html`
      <wui-flex justifyContent="center" alignItems="center" class="icon-box error">
        <wui-icon size="xxl" color="error" name="close"></wui-icon>
      </wui-flex>
    `
  }

  private templateContent() {
    if (this.statusType === 'pending') {
      return this.templatePending()
    }

    if (this.statusType === 'success') {
      return this.templateSuccess()
    }

    return this.templateError()
  }

  private templatePending() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text variant="h6-medium" color="primary">Transfer in progress</wui-text>
        <wui-text variant="sm-regular" color="secondary" align="center">
          Your transfer is being processed. This may take a few moments.
        </wui-text>
      </wui-flex>

      ${this.templateTransferDetails()}
    `
  }

  private templateSuccess() {
    const inTxHash = (this.transferStatus?.['inTxHashes'] as string[] | undefined)?.[0]
    const outTxHash = (this.transferStatus?.['txHashes'] as string[] | undefined)?.[0]

    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text variant="h6-medium" color="primary">Transfer successful!</wui-text>
        <wui-text variant="sm-regular" color="secondary" align="center">
          Your transfer has been completed successfully.
        </wui-text>
      </wui-flex>

      ${this.templateTransferDetails()} ${this.templateTransactionHashes(inTxHash, outTxHash)}

      <wui-flex flexDirection="column" gap="2" class="action-buttons">
        <wui-button
          fullWidth
          @click=${this.onClose.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `
  }

  private templateError() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text variant="h6-medium" color="primary">Transfer failed</wui-text>
        <wui-text variant="sm-regular" color="secondary" align="center">
          ${this.errorMessage || 'Something went wrong with your transfer. Please try again.'}
        </wui-text>
      </wui-flex>

      ${this.templateTransferDetails()}

      <wui-flex flexDirection="column" gap="2" class="action-buttons">
        <wui-button
          fullWidth
          @click=${this.onTryAgain.bind(this)}
          size="lg"
          variant="accent-primary"
        >
          Try Again
        </wui-button>
        <wui-button
          fullWidth
          @click=${this.onClose.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `
  }

  private templateTransferDetails() {
    if (!this.quote) {
      return null
    }

    const sourceToken = TransfersController.state.sourceToken
    const toToken = TransfersController.state.toToken

    return html`
      <wui-flex flexDirection="column" gap="2" class="transfer-details-container">
        ${sourceToken
          ? html`
              <wui-flex
                justifyContent="space-between"
                alignItems="center"
                class="details-row"
                .padding=${['3', '4', '3', '4'] as const}
              >
                <wui-flex alignItems="center" gap="2">
                  <wui-image class="token-image" src=${ifDefined(sourceToken.logoUri)}></wui-image>
                  <wui-text variant="sm-regular" color="secondary">From</wui-text>
                </wui-flex>
                <wui-flex flexDirection="column" alignItems="flex-end" gap="0">
                  <wui-text variant="sm-regular" color="primary">
                    ${this.quote.origin.amountFormatted} ${sourceToken.symbol}
                  </wui-text>
                  <wui-image
                    class="chain-image"
                    src=${ifDefined(
                      AssetUtil.getNetworkImageByCaipNetworkId(sourceToken.caipNetworkId)
                    )}
                  ></wui-image>
                </wui-flex>
              </wui-flex>
            `
          : null}
        ${toToken
          ? html`
              <wui-flex
                justifyContent="space-between"
                alignItems="center"
                class="details-row"
                .padding=${['3', '4', '3', '4'] as const}
              >
                <wui-flex alignItems="center" gap="2">
                  <wui-image class="token-image" src=${ifDefined(toToken.logoUri)}></wui-image>
                  <wui-text variant="sm-regular" color="secondary">To</wui-text>
                </wui-flex>
                <wui-flex flexDirection="column" alignItems="flex-end" gap="0">
                  <wui-text variant="sm-regular" color="primary">
                    ${this.quote.destination.amountFormatted} ${toToken.symbol}
                  </wui-text>
                  <wui-image
                    class="chain-image"
                    src=${ifDefined(
                      AssetUtil.getNetworkImageByCaipNetworkId(toToken.caipNetworkId)
                    )}
                  ></wui-image>
                </wui-flex>
              </wui-flex>
            `
          : null}
      </wui-flex>
    `
  }

  private templateTransactionHashes(inTxHash?: string, outTxHash?: string) {
    if (!inTxHash && !outTxHash) {
      return null
    }

    const { originLink, destinationLink } = this.getTransactionLinks()

    return html`
      <wui-flex flexDirection="column" gap="2" class="tx-hashes-container">
        ${inTxHash
          ? html`
              <wui-flex
                justifyContent="space-between"
                alignItems="center"
                class="details-row"
                .padding=${['3', '4', '3', '4'] as const}
              >
                <wui-text variant="sm-regular" color="secondary">Origin TX</wui-text>
                <wui-flex alignItems="center" gap="1">
                  <wui-text variant="sm-regular" color="primary">
                    ${this.formatTxHash(inTxHash)}
                  </wui-text>
                  <wui-icon
                    size="sm"
                    color="accent-100"
                    name="externalLink"
                    @click=${() => CoreHelperUtil.openHref(originLink, '_blank')}
                  ></wui-icon>
                </wui-flex>
              </wui-flex>
            `
          : null}
        ${outTxHash
          ? html`
              <wui-flex
                justifyContent="space-between"
                alignItems="center"
                class="details-row"
                .padding=${['3', '4', '3', '4'] as const}
              >
                <wui-text variant="sm-regular" color="secondary">Destination TX</wui-text>
                <wui-flex alignItems="center" gap="1">
                  <wui-text variant="sm-regular" color="primary">
                    ${this.formatTxHash(outTxHash)}
                  </wui-text>
                  <wui-icon
                    size="sm"
                    color="accent-100"
                    name="externalLink"
                    @click=${() => CoreHelperUtil.openHref(destinationLink, '_blank')}
                  ></wui-icon>
                </wui-flex>
              </wui-flex>
            `
          : null}
      </wui-flex>
    `
  }

  private formatTxHash(hash: string): string {
    if (hash.length <= 16) {
      return hash
    }
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  private async startPolling() {
    if (!this.quote?.requestId) {
      return
    }

    // Poll immediately
    await this.checkStatus()

    // Then poll every 1.5 seconds
    this.pollingInterval = setInterval(() => {
      this.checkStatus()
    }, 1500)
  }

  private async checkStatus() {
    if (!this.quote?.requestId) {
      return
    }

    if (this.transferStatus?.status === 'success') {
      this.statusType = 'success'
      this.stopPolling()
      return
    }

    // Check if max attempts reached
    if (this.pollingAttempts >= this.maxPollingAttempts) {
      this.statusType = 'error'
      this.errorMessage = 'Transfer status check timed out. Please check your wallet.'
      this.stopPolling()
      return
    }

    this.pollingAttempts++

    try {
      const { status, requestId } = await TransfersController.fetchStatus(this.quote?.requestId)
      console.log('Transfer status:', status)

      if (!status) {
        return
      }

      this.transferStatus = {
        status,
        requestId
      }

      if (status === 'success') {
        this.statusType = 'success'
        this.stopPolling()
      } else if (status === 'failure') {
        this.statusType = 'error'
        this.errorMessage = 'Transfer failed. Please try again.'
        this.stopPolling()
      }
    } catch (error) {
      console.error('Failed to fetch transfer status:', error)
      if (this.pollingAttempts >= this.maxPollingAttempts) {
        this.statusType = 'error'
        this.errorMessage =
          error instanceof Error ? error.message : 'Failed to check transfer status'
        this.stopPolling()
      }
    }
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = undefined
    }
  }

  private getTransactionLinks() {
    if (!this.quote) {
      return {
        originLink: '',
        destinationLink: ''
      }
    }

    const inTxHash = (this.transferStatus?.['inTxHashes'] as string[] | undefined)?.[0]
    const outTxHash = (this.transferStatus?.['txHashes'] as string[] | undefined)?.[0]

    const { origin, destination } = this.quote

    const explorerUrl = ChainController.getCaipNetworkById(origin.chainId)?.blockExplorers?.default
      .url
    const originLink = explorerUrl ? `${explorerUrl}/tx/${inTxHash}` : ''

    const destinationExplorerUrl = ChainController.getCaipNetworkById(destination.chainId)
      ?.blockExplorers?.default.url
    const destinationLink = destinationExplorerUrl
      ? `${destinationExplorerUrl}/tx/${outTxHash}`
      : ''

    return { originLink, destinationLink }
  }

  private onTryAgain() {
    RouterController.push('Transfers')
  }

  private onClose() {
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transfers-confirmation-view': W3mTransfersConfirmationView
  }
}
