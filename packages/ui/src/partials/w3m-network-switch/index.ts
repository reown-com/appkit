import { EventsCtrl, ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-network-switch')
export class W3mNetworkSwitch extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ----------------------------------------------- //
  @state() private chainId? = ''

  @state() private label? = ''

  @state() private wrongNetwork = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    const { selectedChain } = OptionsCtrl.state
    this.onSetChainData(selectedChain)
    this.unsubscribeNetwork = OptionsCtrl.subscribe(({ selectedChain: newChain }) => {
      this.onSetChainData(newChain)
    })
  }

  public disconnectedCallback() {
    this.unsubscribeNetwork?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeNetwork?: () => void = undefined

  private onSetChainData(chain: typeof OptionsCtrl.state.selectedChain) {
    if (chain) {
      const { chains } = OptionsCtrl.state
      const chainIds = chains?.map(c => c.id)
      this.chainId = chain.id.toString()
      this.wrongNetwork = !chainIds?.includes(chain.id)
      this.label = this.wrongNetwork ? 'Wrong Network' : chain.name
    }
  }

  private onClick() {
    EventsCtrl.click({ name: 'NETWORK_BUTTON' })
    ModalCtrl.open({ route: 'SelectNetwork' })
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state
    const isMultichain = chains && chains.length > 1

    return html`
      <w3m-button-big
        @click=${this.onClick}
        ?disabled=${!isMultichain}
        data-testid="partial-network-switch-button"
      >
        <w3m-network-image
          chainId=${ifDefined(this.chainId)}
          data-testid="partial-network-switch-image"
        ></w3m-network-image>
        <w3m-text
          variant="medium-regular"
          color="inverse"
          data-testid="partial-network-switch-text"
        >
          ${this.label?.length ? this.label : 'Select Network'}
        </w3m-text>
      </w3m-button-big>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-switch': W3mNetworkSwitch
  }
}
