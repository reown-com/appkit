import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import '../../components/wui-image'
import '../../components/wui-text'
import '../../layout/wui-flex'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { AccountEntryType, IconType } from '../../utils/TypesUtil'
import '../wui-icon-box'
import styles from './styles'

@customElement('wui-list-item')
export class WuiListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon?: IconType

  @property() public variant: AccountEntryType = 'icon'

  @property() public iconVariant?: 'blue' | 'overlay'

  @property({ type: Boolean }) public disabled = false

  @property() public imageSrc?: string = undefined

  @property() public alt?: string = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        ${this.visualTemplate()}
        <wui-flex gap="3xs">
          <slot></slot>
        </wui-flex>
        <wui-icon size="inherit" color="inherit" name="chevronRight"></wui-icon>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.variant === 'image' && this.imageSrc && this.alt) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`
    } else if (this.variant === 'icon' && this.icon && this.iconVariant) {
      const color = this.iconVariant === 'blue' ? 'blue-100' : 'fg-200'

      return html` <wui-icon-box
        data-variant=${this.iconVariant}
        icon=${this.icon}
        background="transparent"
        iconColor=${color}
        backgroundColor=${color}
        size="md"
      ></wui-icon-box>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-item': WuiListItem
  }
}
