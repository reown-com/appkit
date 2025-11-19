import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  BackgroundColorType,
  IconColorType,
  IconType,
  SizeType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-item')
export class WuiListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type?: 'primary' | 'secondary' = 'primary'

  @property() public imageSrc = 'google'

  @property() public imageSize?: SizeType = undefined

  @property() public icon?: IconType

  @property() public iconColor?: IconColorType

  @property({ type: Boolean }) public loading = false

  @property() public tabIdx?: boolean

  @property() public boxColor?: BackgroundColorType = 'foregroundPrimary'

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public rightIcon = true

  @property({ type: Boolean }) public boxed = true

  @property({ type: Boolean }) public rounded = false

  @property({ type: Boolean }) public fullSize = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['rounded'] = this.rounded ? 'true' : 'false'
    this.dataset['type'] = this.type

    return html`
      <button
        ?disabled=${this.loading ? true : Boolean(this.disabled)}
        data-loading=${this.loading}
        tabindex=${ifDefined(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private templateLeftIcon() {
    if (this.icon) {
      return html`<wui-image
        icon=${this.icon}
        iconColor=${ifDefined(this.iconColor)}
        ?boxed=${this.boxed}
        ?rounded=${this.rounded}
        boxColor=${this.boxColor}
      ></wui-image>`
    }

    return html`<wui-image
      ?boxed=${this.boxed}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      size=${ifDefined(this.imageSize)}
      src=${this.imageSrc}
      boxColor=${this.boxColor}
    ></wui-image>`
  }

  private templateRightIcon() {
    if (!this.rightIcon) {
      return null
    }

    if (this.loading) {
      return html`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`
    }

    return html`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-item': WuiListItem
  }
}
