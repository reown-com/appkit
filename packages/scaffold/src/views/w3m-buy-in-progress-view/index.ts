import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  OnRampController,
  RouterController,
  SnackController,
  ThemeController,
  BlockchainApiController,
  OptionsController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-buy-in-progress-view')
export class W3mBuyInProgressView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() protected selectedOnRampProvider = OnRampController.state.selectedProvider

  @state() protected uri = ConnectionController.state.wcUri

  @state() protected ready = false

  @state() private showRetry = false

  @state() public buffering = false

  @state() private error = false

  @state() private intervalId?: NodeJS.Timeout

  @state() private startTime: number | null = null

  @property({ type: Boolean }) public isMobile = false

  @property() public onRetry?: (() => void) | (() => Promise<void>) = undefined

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('selectedProvider', val => {
          this.selectedOnRampProvider = val
        })
      ]
    )
    this.watchTransactions()
  }

  public override disconnectedCallback() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    let label = 'Continue in external window'

    if (this.error) {
      label = 'Buy failed'
    } else if (this.selectedOnRampProvider) {
      label = `Buy in ${this.selectedOnRampProvider?.label}`
    }

    const subLabel = this.error
      ? 'Buy can be declined from your side or due to and error on the provider app'
      : `We’ll notify you once your Buy is processed`

    return html`
      <wui-flex
        data-error=${ifDefined(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', 'xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${ifDefined(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error ? null : this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error ? 'error-100' : 'fg-100'}>
            ${label}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${subLabel}</wui-text>
        </wui-flex>

        ${this.error ? this.tryAgainTemplate() : null}
      </wui-flex>

      <wui-flex .padding=${['0', 'xl', 'xl', 'xl'] as const} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="fg-200">
          <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private watchTransactions() {
    if (!this.selectedOnRampProvider) {
      return
    }

    switch (this.selectedOnRampProvider.name) {
      case 'coinbase':
        this.startTime = Date.now()
        this.initializeCoinbaseTransactions()
        break
      default:
        break
    }
  }

  private async initializeCoinbaseTransactions() {
    await this.watchCoinbaseTransactions()
    this.intervalId = setInterval(() => this.watchCoinbaseTransactions(), 4000)
  }

  private async watchCoinbaseTransactions() {
    try {
      const address = AccountController.state.address
      const projectId = OptionsController.state.projectId
      if (!address) {
        throw new Error('No address found')
      }

      const coinbaseResponse = await BlockchainApiController.fetchTransactions({
        account: address,
        onramp: 'coinbase',
        projectId
      })

      const newTransactions = coinbaseResponse.data.filter(
        tx =>
          // @ts-expect-error - start time will always be set at this point
          new Date(tx.metadata.minedAt) > new Date(this.startTime) ||
          tx.metadata.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'
      )

      if (newTransactions.length) {
        clearInterval(this.intervalId)
        RouterController.replace('OnRampActivity')
      } else if (this.startTime && Date.now() - this.startTime >= 180_000) {
        clearInterval(this.intervalId)
        this.error = true
      }
    } catch (error) {
      SnackController.showError(error)
    }
  }

  private onTryAgain() {
    if (!this.selectedOnRampProvider) {
      return
    }

    this.error = false
    CoreHelperUtil.openHref(
      this.selectedOnRampProvider.url,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
  }

  private tryAgainTemplate() {
    if (!this.selectedOnRampProvider?.url) {
      return null
    }

    return html`<wui-button variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`
  }

  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    return html`<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`
  }

  private onCopyUri() {
    if (!this.selectedOnRampProvider?.url) {
      SnackController.showError('No link found')
      RouterController.goBack()

      return
    }

    try {
      CoreHelperUtil.copyToClopboard(this.selectedOnRampProvider.url)
      SnackController.showSuccess('Link copied')
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-buy-in-progress-view': W3mBuyInProgressView
  }
}
