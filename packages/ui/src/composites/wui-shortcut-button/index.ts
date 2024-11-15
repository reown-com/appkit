import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type {
  ButtonSize,
  ColorType,
  IconType,
  ShortcutButtonVariant,
  SizeType
} from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

// -- Component ------------------------------------------ //
@customElement('wui-shortcut-button')
export class WuiShortcutButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public size: ButtonSize = 'lg'

  @property({ type: Boolean }) public disabled = false

  @property() public variant: ShortcutButtonVariant = 'accent'

  @property() public icon: IconType = 'copy'

  @property() public iconSize?: Exclude<SizeType, 'inherit'>

  @property() public iconColor: ColorType = 'accent-100'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.disabled}
        ontouchstart
      >
        <wui-icon color=${this.iconColor} size=${this.iconSize} name=${this.icon}></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-shortcut-button': WuiShortcutButton
  }
}
