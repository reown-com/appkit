import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'
import type { BorderRadiusType } from '../../utils/TypesUtil'

@customElement('wui-shimmer')
export class WuiShimmer extends LitElement {
  public static styles = [styles]

  @property() public width = ''

  @property() public height = ''

  @property() public borderRadius: BorderRadiusType = 'm'

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
