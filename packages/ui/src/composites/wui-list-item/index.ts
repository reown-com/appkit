import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconColorType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-item')
export class WuiListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = 'google'

  @property() public icon?: IconType

  @property() public iconColor?: IconColorType

  @property({ type: Boolean }) public loading = false

  @property() public tabIdx?: boolean

  @property({ type: Boolean }) public disabled = false

  @property({ type: Boolean }) public rightIcon = true

  @property({ type: Boolean }) public rounded = false

  @property({ type: Boolean }) public fullSize = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['rounded'] = this.rounded ? 'true' : 'false'

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
        ?boxed=${true}
        ?rounded=${this.rounded}
      ></wui-image>`
    }

    return html`<wui-image
      ?boxed=${true}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
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
