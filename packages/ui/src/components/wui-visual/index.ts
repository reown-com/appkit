import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { browserSvg } from '../../assets/visual/browser.js'
import { daoSvg } from '../../assets/visual/dao.js'
import { defiSvg } from '../../assets/visual/defi.js'
import { defiAltSvg } from '../../assets/visual/defiAlt.js'
import { ethSvg } from '../../assets/visual/eth.js'
import { layersSvg } from '../../assets/visual/layers.js'
import { lockSvg } from '../../assets/visual/lock.js'
import { loginSvg } from '../../assets/visual/login.js'
import { networkSvg } from '../../assets/visual/network.js'
import { nftSvg } from '../../assets/visual/nft.js'
import { nounSvg } from '../../assets/visual/noun.js'
import { profileSvg } from '../../assets/visual/profile.js'
import { systemSvg } from '../../assets/visual/system.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { VisualType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

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
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public name: VisualType = 'browser'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-visual': WuiVisual
  }
}
