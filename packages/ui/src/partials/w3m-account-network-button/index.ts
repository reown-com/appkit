import { OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-network-button')
export class W3mAccountNetworkButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ----------------------------------------------- //
  @state() private chainId? = 0

  @state() private label? = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    const { selectedChain } = OptionsCtrl.state
    this.chainId = selectedChain?.id
    this.label = selectedChain?.name
    this.unsubscribeNetwork = OptionsCtrl.subscribe(({ selectedChain: newChain }) => {
      this.chainId = newChain?.id
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
    const { chains, selectedChain } = OptionsCtrl.state
    const supportedChainIds = chains?.map(chain => chain.id)
    const isChainSupported = selectedChain && supportedChainIds?.includes(selectedChain.id)
    const isSwitchNetoworkDisabled = chains && chains.length <= 1 && isChainSupported

    return html`
      <button @click=${this.onClick} ?disabled=${isSwitchNetoworkDisabled}>
        <w3m-network-image chainId=${ifDefined(this.chainId)}></w3m-network-image>
        <w3m-text variant="xsmall-regular" color="accent">${this.label}</w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-network-button': W3mAccountNetworkButton
  }
}
