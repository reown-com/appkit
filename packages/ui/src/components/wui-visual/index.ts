import { html, LitElement, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import type { VisualType } from '../../utils/TypesUtil'
import styles from './styles'
import { browserSvg } from '../../assets/visual/browser'
import { daoSvg } from '../../assets/visual/dao'
import { defiSvg } from '../../assets/visual/defi'
import { defiAltSvg } from '../../assets/visual/defiAlt'
import { ethSvg } from '../../assets/visual/eth'
import { layersSvg } from '../../assets/visual/layers'
import { lockSvg } from '../../assets/visual/lock'
import { loginSvg } from '../../assets/visual/login'
import { networkSvg } from '../../assets/visual/network'
import { nftSvg } from '../../assets/visual/nft'
import { nounSvg } from '../../assets/visual/noun'
import { profileSvg } from '../../assets/visual/profile'
import { systemSvg } from '../../assets/visual/system'

// -- Svg's-------------------------------- //
const svgOptions: Record<VisualType, TemplateResult<2>> = {
  browser: browserSvg,
  dao: daoSvg,
  defi: defiSvg,
  defiAlt: defiAltSvg,
  eth: ethSvg,
  layers: layersSvg,
  lock: lockSvg,
  login: loginSvg,
  network: networkSvg,
  nft: nftSvg,
  noun: nounSvg,
  profile: profileSvg,
  system: systemSvg
}

@customElement('wui-visual')
export class WuiVisual extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public name: VisualType = 'browser'

  // -- Render -------------------------------------------- //
  public render() {
    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-visual': WuiVisual
  }
}
