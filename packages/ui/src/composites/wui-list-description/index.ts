import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import '../wui-tag/index.js'
import styles from './styles.js'

@customElement('wui-list-description')
export class WuiListDescription extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'card'

  @property() public text = ''

  @property() public description = ''

  @property() public tag?: string = undefined

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled}>
        <wui-flex justifyContent="space-between" alignItems="flex-start">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-tag tagType="main" size="sm">${this.tag}</wui-tag>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            <wui-text variant="md-regular" color="secondary">${this.description}</wui-text>
          </wui-flex>
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-description': WuiListDescription
  }
}
