import { ChainController, ModalController, RouterController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { ConstantsUtil } from '@reown/appkit-common'
import { property } from 'lit/decorators.js'

@customElement('w3m-switch-active-chain-view')
export class W3mSwitchActiveChainView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  protected readonly switchToChain = RouterController.state.data?.switchToChain

  protected readonly navigateTo = RouterController.state.data?.navigateTo

  protected readonly navigateWithReplace = RouterController.state.data?.navigateWithReplace

  protected readonly caipNetwork = RouterController.state.data?.network

  // -- State & Properties -------------------------------- //
  @property() public activeChain = ChainController.state.activeChain

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.unsubscribe.push(
      ChainController.subscribeKey('activeChain', val => (this.activeChain = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const switchedChainNameString = this.switchToChain
      ? ConstantsUtil.CHAIN_NAME_MAP[this.switchToChain]
      : 'supported'

    if (!this.switchToChain) {
      return null
    }

    const nextChainName = this.switchToChain === 'eip155' ? 'Ethereum' : this.switchToChain

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', 'xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="xl">
          <wui-visual
            name=${this.switchToChain === 'eip155' ? 'eth' : this.switchToChain}
          ></wui-visual>
          <wui-text
            data-testid=${`w3m-switch-active-chain-to-${nextChainName}`}
            variant="paragraph-500"
            color="fg-100"
            align="center"
            >Switch to <span class="capitalize">${nextChainName}</span></wui-text
          >
          <wui-text variant="small-400" color="fg-200" align="center">
            Connected wallet doesn't support connecting to ${switchedChainNameString} chain. You
            need to connect with a different wallet.
          </wui-text>
          <wui-button size="md" @click=${this.switchActiveChain.bind(this)}>Switch</wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ------------------------------------ //
  private async switchActiveChain() {
    if (!this.switchToChain) {
      return
    }

    if (this.caipNetwork) {
      await ChainController.switchActiveNetwork(this.caipNetwork)
    } else {
      ChainController.setActiveNamespace(this.switchToChain)
    }

    ModalController.close()
    ModalController.open({
      view: 'Connect'
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-active-chain-view': W3mSwitchActiveChainView
  }
}
