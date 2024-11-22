import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-network-image')
export class WuiNetworkImage extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xxl' | 'xl' | 'xs' | 'mdl' | 'xxs'> = 'md'

  @property() public name = 'uknown'

  @property() public imageSrc?: string

  @property({ type: Boolean }) public selected?: boolean = false

  @property({ type: Boolean }) public round?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.round) {
      this.dataset['round'] = 'true'
      this.style.cssText = `
      --local-width: var(--wui-spacing-3xl);
      --local-height: var(--wui-spacing-3xl);
      --local-icon-size: var(--wui-spacing-l);
    `
    } else {
      this.style.cssText = `

      --local-path: var(--wui-path-network-${this.size});
      --local-width:  var(--wui-width-network-${this.size});
      --local-height:  var(--wui-height-network-${this.size});
      --local-icon-size:  var(--wui-icon-size-network-${this.size});
    `
    }

    // eslint-disable-next-line no-nested-ternary
    return html`${this.templateVisual()} ${this.svgTemplate()} `
  }

  // -- Private ------------------------------------------- //
  private svgTemplate() {
    if (this.round) {
      return null
    }

    return null
  }
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="iconInverse" name="allWallets"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-image': WuiNetworkImage
  }
}
