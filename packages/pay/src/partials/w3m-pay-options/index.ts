import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { NumberUtil } from '@reown/appkit-common'
import { AssetUtil, ChainController } from '@reown/appkit-controllers'
import { MathUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

import type { PaymentAssetWithAmount } from '../../types/options.js'
import styles from './styles.js'

// -- Constants ----------------------------------------- //
const SCROLL_THRESHOLD = 300

@customElement('w3m-pay-options')
export class W3mPayOptions extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []
  private resizeObserver?: ResizeObserver

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public options: PaymentAssetWithAmount[] = []
  @property() public selectedPaymentAsset: PaymentAssetWithAmount | null = null
  @property() public onSelect?: (selectedPaymentAsset: PaymentAssetWithAmount) => void

  public constructor() {
    super()
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.resizeObserver?.disconnect()
    const optionsEl = this.shadowRoot?.querySelector('.pay-options-container')
    optionsEl?.removeEventListener('scroll', this.handleOptionsListScroll.bind(this))
  }

  public override firstUpdated() {
    const optionsEl = this.shadowRoot?.querySelector('.pay-options-container')
    if (optionsEl) {
      // Use requestAnimationFrame to access scroll properties before the next repaint
      requestAnimationFrame(this.handleOptionsListScroll.bind(this))
      optionsEl?.addEventListener('scroll', this.handleOptionsListScroll.bind(this))
      this.resizeObserver = new ResizeObserver(() => {
        this.handleOptionsListScroll()
      })
      this.resizeObserver?.observe(optionsEl)
      this.handleOptionsListScroll()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(option => this.payOptionTemplate(option))}
      </wui-flex>
    `
  }

  private payOptionTemplate(paymentAsset: PaymentAssetWithAmount) {
    const { network, metadata, asset, amount = '0' } = paymentAsset

    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === network)

    const paymentCaipAddress = `${network}:${asset}`
    const selectedPaymentCaipAddress = `${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`

    const isSelected = paymentCaipAddress === selectedPaymentCaipAddress

    const bigAmount = NumberUtil.bigNumber(amount, { safe: true })
    const hasEnoughBalance = bigAmount.gt(0)

    return html`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${() => this.onSelect?.(paymentAsset)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${ifDefined(metadata.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${metadata.symbol}</wui-text>
            ${hasEnoughBalance
              ? html`<wui-text variant="sm-regular" color="secondary">
                  ${bigAmount.round(6).toString()} ${metadata.symbol}
                </wui-text>`
              : null}
          </wui-flex>
        </wui-flex>

        ${isSelected
          ? html`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`
          : null}
      </wui-flex>
    `
  }

  // -- Private Methods ----------------------------------- //
  private handleOptionsListScroll() {
    const optionsEl = this.shadowRoot?.querySelector('.pay-options-container') as
      | HTMLElement
      | undefined

    if (!optionsEl) {
      return
    }

    const shouldApplyMask = optionsEl.scrollHeight > SCROLL_THRESHOLD

    if (shouldApplyMask) {
      optionsEl.style.setProperty(
        '--options-mask-image',
        `linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,
          black 50px,
          black calc(100% - 50px),
          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%
        )`
      )

      optionsEl.style.setProperty(
        '--options-scroll--top-opacity',
        MathUtil.interpolate([0, 50], [0, 1], optionsEl.scrollTop).toString()
      )
      optionsEl.style.setProperty(
        '--options-scroll--bottom-opacity',
        MathUtil.interpolate(
          [0, 50],
          [0, 1],
          optionsEl.scrollHeight - optionsEl.scrollTop - optionsEl.offsetHeight
        ).toString()
      )
    } else {
      optionsEl.style.setProperty('--options-mask-image', 'none')
      optionsEl.style.setProperty('--options-scroll--top-opacity', '0')
      optionsEl.style.setProperty('--options-scroll--bottom-opacity', '0')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-options': W3mPayOptions
  }
}
