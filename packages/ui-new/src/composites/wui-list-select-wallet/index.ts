import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../wui-icon-box/index.js'
import '../wui-tag/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import type { IconType, TagVariant, WalletListSelectVariant } from '../../utils/TypeUtil.js'

// -- Constants ----------------------------------------- //
const TEXT_COLOR_BY_VARIANT = {
  primary: 'primary',
  secondary: 'secondary'
}

const ICON_BOX_COLOR_BY_VARIANT = {
  primary: 'foregroundPrimary',
  secondary: 'foregroundSecondary'
}

@customElement('wui-list-select-wallet')
export class WuiListSelectWallet extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc? = ''

  @property() public name = ''

  @property() public variant: WalletListSelectVariant = 'primary'

  @property() public tagLabel?: string

  @property() public tagVariant: TagVariant = 'accent'

  @property() public icon?: IconType

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['variant'] = this.variant

    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        ${this.leftImageTemplate()}
        <wui-text color=${TEXT_COLOR_BY_VARIANT[this.variant]} variant="lg-regular" lineClamp="1"
          >${this.name}</wui-text
        >
        ${this.tagTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftImageTemplate() {
    if (this.icon) {
      return html`<wui-icon-box
        iconcolor="default"
        iconsize="mdl"
        spacing="md"
        backgroundColor=${ICON_BOX_COLOR_BY_VARIANT[this.variant]}
        icon=${this.icon}
      ></wui-icon-box>`
    }

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return null
  }

  private tagTemplate() {
    if (this.tagVariant && this.tagLabel) {
      return html`
        <wui-flex columnGap="2" alignItems="center">
          <wui-tag variant=${this.tagVariant} size="sm">${this.tagLabel}</wui-tag>
          <wui-icon color="default" size="md" name="chevronRight"></wui-icon>
        </wui-flex>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-select-wallet': WuiListSelectWallet
  }
}
