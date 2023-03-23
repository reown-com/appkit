import { ThemeCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-connector-image')
export class W3mConnectorImage extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public walletId?: string = undefined
  @property() public imageId?: string = undefined

  // -- private ------------------------------------------------------ //
  private svgLoaderTemplate() {
    const ICON_SIZE = 88
    const DH_ARRAY = 317
    const DH_OFFSET = 425

    const radius =
      ThemeCtrl.state.themeVariables?.['--w3m-wallet-icon-large-border-radius'] ??
      ThemeUtil.getPreset('--w3m-wallet-icon-large-border-radius')
    let numRadius = 0

    if (radius?.includes('%')) {
      numRadius = (ICON_SIZE / 100) * parseInt(radius, 10)
    } else {
      numRadius = parseInt(radius ?? '0', 10)
    }

    numRadius *= 1.17
    const dashArray = DH_ARRAY - numRadius * 1.57
    const dashOffset = DH_OFFSET - numRadius * 1.8

    return html`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect id="w3m-loader" x="2" y="2" width="106" height="106" rx=${numRadius} />
        <use
          xlink:href="#w3m-loader"
          stroke-dasharray="106 ${dashArray}"
          stroke-dashoffset=${dashOffset}
        ></use>
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        ${this.svgLoaderTemplate()}

        <w3m-wallet-image walletId=${this.walletId} imageId=${this.imageId}></w3m-wallet-image>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-image': W3mConnectorImage
  }
}
