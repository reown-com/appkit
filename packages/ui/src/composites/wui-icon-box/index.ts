import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/wui-icon'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-icon-box')
export class WuiIconBox extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xs' | 'xxs'> = 'md'

  @property() public backgroundColor: ColorType = 'blue-100'

  @property() public iconColor: ColorType = 'blue-100'

  @property() public icon: IconType = 'copy'

  // -- Render -------------------------------------------- //
  public render() {
    let iconSize: SizeType = 'xxs'
    switch (this.size) {
      case 'lg':
        iconSize = 'lg'
        break
      case 'md':
        iconSize = 'xs'
        break
      default:
        iconSize = 'xxs'
    }

    const classes = {
      [`wui-size-${this.size}`]: true,
      [`wui-overlay-${this.size === 'lg' ? 'sm' : 'md'}`]: true
    }

    const bgColorStyle = `--wui-bg-value: var(--wui-color-${this.backgroundColor});`

    return html`
      <div class="wui-overlay-default ${classMap(classes)}" style=${bgColorStyle}>
        <wui-icon color=${this.iconColor} size=${iconSize} name=${this.icon}></wui-icon>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-box': WuiIconBox
  }
}
