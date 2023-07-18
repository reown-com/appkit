import { ThemeCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-connector-waiting')
export class W3mConnectorWaiting extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public walletId?: string = undefined

  @property() public imageId?: string = undefined

  @property() public isError = false

  @property() public isStale = false

  @property() public label = ''

  // -- private ------------------------------------------------------ //
  private svgLoaderTemplate() {
    const ICON_SIZE = 88
    const DH_ARRAY = 317
    const DH_OFFSET = 425

    const radius =
      ThemeCtrl.state.themeVariables?.['--w3m-wallet-icon-large-border-radius'] ??
      ThemeUtil.getPreset('--w3m-wallet-icon-large-border-radius')
    let numRadius = 0

    if (radius.includes('%')) {
      numRadius = (ICON_SIZE / 100) * parseInt(radius, 10)
    } else {
      numRadius = parseInt(radius, 10)
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
    const classes = {
      'w3m-error': this.isError,
      'w3m-stale': this.isStale
    }

    return html`
      <div class=${classMap(classes)}>
        ${this.svgLoaderTemplate()}
        <w3m-wallet-image
          walletId=${ifDefined(this.walletId)}
          imageId=${ifDefined(this.imageId)}
          data-useid="partial-connector-wallet-image"
        ></w3m-wallet-image>
      </div>
      <w3m-text
        variant="medium-regular"
        color=${this.isError ? 'error' : 'primary'}
        data-useid="partial-connector-error-text"
      >
        ${this.isError ? 'Connection declined' : this.label}
      </w3m-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-waiting': W3mConnectorWaiting
  }
}
