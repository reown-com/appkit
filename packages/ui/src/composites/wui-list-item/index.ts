import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { AccountEntryType, IconType } from '../../utils/TypesUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

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

  @property({ type: Boolean }) public chevron = false

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button
        ?disabled=${this.loading ? true : Boolean(this.disabled)}
        data-loading=${this.loading}
        ontouchstart
      >
        ${this.loadingTemplate()} ${this.visualTemplate()}
        <wui-flex gap="3xs">
          <slot></slot>
        </wui-flex>
        ${this.chevronTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.variant === 'image' && this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt ?? 'list item'}></wui-image>`
    } else if (this.variant === 'icon' && this.icon && this.iconVariant) {
      const color = this.iconVariant === 'blue' ? 'accent-100' : 'fg-200'

      return html`
        <wui-icon-box
          data-variant=${this.iconVariant}
          icon=${this.icon}
          background="transparent"
          iconColor=${color}
          backgroundColor=${color}
          size="md"
        ></wui-icon-box>
      `
    }

    return null
  }

  public loadingTemplate() {
    if (this.loading) {
      return html`<wui-loading-spinner color="fg-300"></wui-loading-spinner>`
    }

    return html``
  }

  public chevronTemplate() {
    if (this.chevron) {
      return html`<wui-icon size="inherit" color="fg-200" name="chevronRight"></wui-icon>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-item': WuiListItem
  }
}
