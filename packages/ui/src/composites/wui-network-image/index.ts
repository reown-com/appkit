import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { networkSvgLg } from '../../assets/svg/networkLg.js'
import { networkSvgMd } from '../../assets/svg/networkMd.js'
import { networkSvgSm } from '../../assets/svg/networkSm.js'
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

  @property({ type: Object }) public networkImagesBySize = {
    sm: networkSvgSm,
    md: networkSvgMd,
    lg: networkSvgLg
  }

  @property() public imageSrc?: string

  @property({ type: Boolean }) public selected?: boolean = false

  @property({ type: Boolean }) public round?: boolean = false

  // -- Render -------------------------------------------- //
  public override render() {
    const getSize = {
      sm: '4',
      md: '6',
      lg: '10'
    } as const

    if (this.round) {
      this.dataset['round'] = 'true'
      this.style.cssText = `
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `
    } else {
      this.style.cssText = `

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${getSize[this.size]});
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

    return this.networkImagesBySize[this.size]
  }
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-image': WuiNetworkImage
  }
}
