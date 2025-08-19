import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
import { NumberUtil } from '@reown/appkit-common'
import { RouterController } from '@reown/appkit-controllers'
import { sendActor } from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-input-amount'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'

import styles from './styles.js'

@customElement('w3m-input-token')
export class W3mInputToken extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private token?: Balance
  @state() private sendTokenAmount?: number
  @state() private loading = false
  @state() private maxAmount = 0
  @state() private exceedsBalance = false

  private unsubscribe: (() => void)[] = []

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    const snapshot = sendActor.getSnapshot()
    this.updateTokenState(snapshot)

    this.unsubscribe.push(
      sendActor.subscribe(actorSnapshot => {
        this.updateTokenState(actorSnapshot)
        this.requestUpdate()
      }).unsubscribe
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private updateTokenState(
    snapshot: typeof sendActor extends { getSnapshot(): infer T } ? T : never
  ) {
    this.token = snapshot.context.selectedToken
    this.sendTokenAmount = snapshot.context.sendAmount
    this.loading = snapshot.context.loading || snapshot.matches('sending')
    this.maxAmount = snapshot.context.selectedToken
      ? Number(snapshot.context.selectedToken.quantity.numeric)
      : 0

    this.exceedsBalance = Boolean(
      snapshot.context.selectedToken &&
        snapshot.context.sendAmount &&
        snapshot.context.sendAmount > Number(snapshot.context.selectedToken.quantity.numeric)
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${['5', '3', '4', '3'] as const}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${!this.token || this.loading}
          .value=${this.sendTokenAmount ? String(this.sendTokenAmount) : ''}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      <wui-flex alignItems="center" justifyContent="space-between">
        ${this.sendValueTemplate()}
        <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
          ${this.maxAmountTemplate()} ${this.actionTemplate()}
        </wui-flex>
      </wui-flex>
    </wui-flex>`
  }

  private buttonTemplate() {
    if (this.token) {
      return html`<wui-token-button
        text=${this.token.symbol}
        imageSrc=${this.token.iconUrl}
        @click=${this.handleSelectButtonClick.bind(this)}
      >
      </wui-token-button>`
    }

    return html`<wui-button
      size="md"
      variant="neutral-secondary"
      @click=${this.handleSelectButtonClick.bind(this)}
      >Select token</wui-button
    >`
  }

  private handleSelectButtonClick() {
    RouterController.push('WalletSendSelectToken')
  }

  private sendValueTemplate() {
    if (this.token && this.sendTokenAmount) {
      const price = this.token.price
      const totalValue = price * this.sendTokenAmount

      return html`<wui-text class="totalValue" variant="sm-regular" color="secondary"
        >${totalValue
          ? `$${NumberUtil.formatNumberToLocalString(totalValue, 2)}`
          : 'Incorrect value'}</wui-text
      >`
    }

    return null
  }

  private maxAmountTemplate() {
    if (this.token) {
      if (this.sendTokenAmount && this.sendTokenAmount > Number(this.token.quantity.numeric)) {
        return html` <wui-text variant="sm-regular" color="error">
          ${UiHelperUtil.roundNumber(Number(this.token.quantity.numeric), 6, 5)}
        </wui-text>`
      }

      return html` <wui-text variant="sm-regular" color="secondary">
        ${UiHelperUtil.roundNumber(Number(this.token.quantity.numeric), 6, 5)}
      </wui-text>`
    }

    return null
  }

  private actionTemplate() {
    if (this.token) {
      if (this.exceedsBalance) {
        return html`<wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>`
      }

      return html`<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`
    }

    return null
  }

  private onInputChange(event: InputEvent) {
    sendActor.send({ type: 'SET_AMOUNT', amount: event.detail })
  }

  private onMaxClick() {
    if (this.maxAmount > 0) {
      sendActor.send({ type: 'SET_AMOUNT', amount: this.maxAmount })
    }
  }

  private onBuyClick() {
    RouterController.push('OnRampProviders')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-token': W3mInputToken
  }
}
