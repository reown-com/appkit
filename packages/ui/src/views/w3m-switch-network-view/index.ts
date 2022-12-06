import { ClientCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-switch-network-view')
export class W3mSwitchNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties -------------------------------------------- //
  @state() private error = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onSwitchNetwork()
  }

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.SwitchNetwork
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  private async onSwitchNetwork() {
    try {
      this.error = false
      const chain = this.getRouterData()
      await ClientCtrl.client().switchNetwork({ chainId: chain.id })
      OptionsCtrl.setSelectedChain(chain)
      RouterCtrl.replace('Account')
    } catch {
      this.error = true
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { id, name } = this.getRouterData()
    const classes = {
      'w3m-wrapper': true,
      'w3m-error': this.error
    }

    return html`
      <w3m-modal-header title=${`Connect to ${name}`}></w3m-modal-header>

      <w3m-modal-content>
        <div class=${classMap(classes)}>
          <w3m-network-image chainId=${id}></w3m-network-image>

          <div class="w3m-connecting-title">
            ${this.error ? null : html`<w3m-spinner></w3m-spinner>`}
            <w3m-text variant="large-bold" color=${this.error ? 'error' : 'secondary'}>
              ${this.error ? 'Connection declined' : 'Approve in your wallet'}
            </w3m-text>
          </div>

          <w3m-button
            .onClick=${this.onSwitchNetwork.bind(this)}
            .disabled=${!this.error}
            .iconRight=${SvgUtil.RETRY_ICON}
          >
            Try Again
          </w3m-button>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-network-view': W3mSwitchNetworkView
  }
}
