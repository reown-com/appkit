import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import { generateAvatarColors } from '../../utils/HelperUtils'

@customElement('wui-avatar')
export class WuiAvatar extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public alt?: string = undefined

  @property() public address?: string = undefined

  // -- Render -------------------------------------------- //
  public render() {
    return html`${this.visualTemplate()}`
  }

  // -- Private ------------------------------------------- //
  public visualTemplate() {
    if (this.imageSrc && this.alt) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`
    } else if (this.address) {
      const cssColors = generateAvatarColors(this.address)
      this.style.cssText = cssColors
      return html`<div class="generated"></div>`
    }

    return html`<div class="default"></div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-avatar': WuiAvatar
  }
}
