import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-item')
export class WuiListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = 'google'

  @property() public text = '0.527 ETH'

  @property() public subtext?: string = undefined

  @property() public icon?: IconType

  @property({ type: Boolean }) public loading = false

  @property() public tabIdx?: boolean

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} tabindex=${ifDefined(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}

          <wui-flex direction="column" gap="1" alignItems="center">
            <wui-text variant="lg-medium" color="primary">${this.text}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${this.subtext}</wui-text>
          </wui-flex>
        </wui-flex>
        ${this.iconTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.icon) {
      return html`<wui-image icon=${this.icon} ?boxed=${true}></wui-image>`
    }

    return html`<wui-image ?boxed=${true} src=${this.imageSrc}></wui-image>`
  }

  private iconTemplate() {
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
