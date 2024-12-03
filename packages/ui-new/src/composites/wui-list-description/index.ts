import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import type { ColorType, IconType } from '../../utils/TypeUtil.js'

@customElement('wui-list-description')
export class WuiListDescription extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'card'

  @property() public text = ''

  @property() public description = ''

  @property() public tag?: string = undefined

  @property() public iconBackgroundColor: ColorType = 'accent-100'

  @property() public iconColor: ColorType = 'accent-100'

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ontouchstart ?disabled=${this.disabled}>
        <wui-icon-box
          iconColor=${this.iconColor}
          backgroundColor=${this.iconBackgroundColor}
          size="inherit"
          icon=${this.icon}
          iconSize="md"
        ></wui-icon-box>
        <wui-flex flexDirection="column" justifyContent="spaceBetween">
          ${this.titleTemplate()}
          <wui-text variant="small-400" color="fg-200"> ${this.description}</wui-text></wui-flex
        >
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private titleTemplate() {
    if (this.tag) {
      return html` <wui-flex alignItems="center" gap="xxs"
        ><wui-text variant="paragraph-500" color="fg-100">${this.text}</wui-text
        ><wui-tag tagType="main" size="md">${this.tag}</wui-tag>
      </wui-flex>`
    }

    return html`<wui-text variant="paragraph-500" color="fg-100">${this.text}</wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-description': WuiListDescription
  }
}
