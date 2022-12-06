import { OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-network-button')
export class W3mAccountNetworkButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ----------------------------------------------- //
  @state() private chainId? = ''
  @state() private label? = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    const { selectedChain } = OptionsCtrl.state
    this.chainId = selectedChain?.id.toString()
    this.label = selectedChain?.name
    this.unsubscribeNetwork = OptionsCtrl.subscribe(({ selectedChain: newChain }) => {
      this.chainId = newChain?.id.toString()
      this.label = newChain?.name
    })
  }

  public disconnectedCallback() {
    this.unsubscribeNetwork?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeNetwork?: () => void = undefined

  private onClick() {
    RouterCtrl.push('SelectNetwork')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state
    const isMultichain = chains && chains.length > 1

    return html`
      <button @click=${this.onClick} ?disabled=${!isMultichain}>
        <w3m-network-image chainId=${ifDefined(this.chainId)}></w3m-network-image>
        <w3m-text variant="xsmall-normal" color="accent">${this.label}</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-network-button': W3mAccountNetworkButton
  }
}
