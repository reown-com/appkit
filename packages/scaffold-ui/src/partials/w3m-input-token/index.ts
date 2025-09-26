import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
import { NumberUtil } from '@reown/appkit-common'
import { RouterController, SendController } from '@reown/appkit-controllers'
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
  @property({ type: Object }) public token?: Balance

  @property({ type: Boolean }) public readOnly = false

  @property({ type: Number }) public sendTokenAmount?: number

  @property({ type: Boolean }) public isInsufficientBalance = false

  // -- Render -------------------------------------------- //
  public override render() {
    const isDisabled = this.readOnly || !this.token

    return html` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${['5', '3', '4', '3'] as const}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${isDisabled}
          .value=${this.sendTokenAmount ? String(this.sendTokenAmount) : ''}
          ?error=${Boolean(this.isInsufficientBalance)}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      ${this.bottomTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
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
    if (!this.readOnly) {
      RouterController.push('WalletSendSelectToken')
    }
  }

  private sendValueTemplate() {
    if (!this.readOnly && this.token && this.sendTokenAmount) {
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
      return html` <wui-text variant="sm-regular" color="secondary">
        ${UiHelperUtil.roundNumber(Number(this.token.quantity.numeric), 6, 5)}
      </wui-text>`
    }

    return null
  }

  private actionTemplate() {
    if (this.token) {
      return html`<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`
    }

    return null
  }

  private bottomTemplate() {
    if (this.readOnly) {
      return null
    }

    return html`<wui-flex alignItems="center" justifyContent="space-between">
      ${this.sendValueTemplate()}
      <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
        ${this.maxAmountTemplate()} ${this.actionTemplate()}
      </wui-flex>
    </wui-flex>`
  }

  private onInputChange(event: InputEvent) {
    SendController.setTokenAmount(event.detail)
  }

  private onMaxClick() {
    if (this.token) {
      const maxValue = NumberUtil.bigNumber(this.token.quantity.numeric)

      SendController.setTokenAmount(Number(maxValue.toFixed(20)))
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-token': W3mInputToken
  }
}
