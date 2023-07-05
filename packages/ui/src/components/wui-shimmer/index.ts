import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { BorderRadiusType } from '../../utils/TypesUtil'
import styles from './styles'

@customElement('wui-shimmer')
export class WuiShimmer extends LitElement {
  public static styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public width = ''

  @property() public height = ''

  @property() public borderRadius: BorderRadiusType = 'm'

  // -- Render -------------------------------------------- //
  public render() {
    this.style.cssText = `
      width: ${this.width};
      height: ${this.height};
      border-radius: ${`var(--wui-border-radius-${this.borderRadius})`};
    `

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-shimmer': WuiShimmer
  }
}
