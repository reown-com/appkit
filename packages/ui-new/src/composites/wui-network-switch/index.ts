import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonSize, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const TEXT_VARIANT_BY_SIZE = {
  sm: 'sm-medium',
  md: 'lg-regular',
  lg: 'lg-regular'
}

const LEFT_ICON_SIZE = {
  sm: 'md',
  md: 'lg',
  lg: 'xl'
}

const RIGHT_ICON_SIZE = {
  sm: 'xxs',
  md: 'xxs',
  lg: 'xs'
}

@customElement('wui-network-switch')
export class WuiNetworkSwitch extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  @property() public icon: IconType = 'networkPlaceholder'

  @property() public size: ButtonSize = 'md'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        ${this.leftIconTemplate()}
        <wui-text color="primary" variant=${TEXT_VARIANT_BY_SIZE[this.size]}>
          <slot></slot>
        </wui-text>
        <wui-icon size=${RIGHT_ICON_SIZE[this.size]} name="chevronBottom"></wui-icon>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private leftIconTemplate() {
    const iconSize = LEFT_ICON_SIZE[this.size]

    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} size=${iconSize} alt="select visual"></wui-image>`
    }

    return html`<wui-icon size=${iconSize} icon=${this.icon}></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-switch': WuiNetworkSwitch
  }
}
