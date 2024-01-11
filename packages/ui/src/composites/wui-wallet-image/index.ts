import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { BorderRadiusType, IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-wallet-image')
export class WuiWalletImage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'xl' | 'xs' | 'xxs'> = 'md'

  @property() public name = ''

  @property() public imageSrc?: string

  @property() public walletIcon?: IconType

  @property({ type: Boolean }) public installed = false

  @property() public badgeSize: SizeType = 'xs'

  // -- Render -------------------------------------------- //
  public override render() {
    let borderRadius: BorderRadiusType = 'xxs'
    if (this.size === 'lg') {
      borderRadius = 'm'
    } else if (this.size === 'md') {
      borderRadius = 'xs'
    } else {
      borderRadius = 'xxs'
    }
    this.style.cssText = `
       --local-border-radius: var(--wui-border-radius-${borderRadius});
       --local-size: var(--wui-wallet-image-size-${this.size});
   `

    if (this.walletIcon) {
      this.dataset['walletIcon'] = this.walletIcon
    }

    return html`
      <wui-flex justifyContent="center" alignItems="center"> ${this.templateVisual()} </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    } else if (this.walletIcon) {
      return html`<wui-icon
        data-parent-size="md"
        size="md"
        color="inherit"
        name=${this.walletIcon}
      ></wui-icon>`
    }

    return html`<wui-icon
      data-parent-size=${this.size}
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-wallet-image': WuiWalletImage
  }
}
