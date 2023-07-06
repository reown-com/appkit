import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import type { IconType } from '../../utils/TypesUtil'

@customElement('wui-input-element')
export class WuiInputElement extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  @property() public icon: IconType = 'copy'

  @property() public onClick: (event: PointerEvent) => void = () => null

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <button @click=${this.onClick.bind(this)}>
        <wui-icon color="inherit" size="xxs" name=${this.icon}></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-input-element': WuiInputElement
  }
}
