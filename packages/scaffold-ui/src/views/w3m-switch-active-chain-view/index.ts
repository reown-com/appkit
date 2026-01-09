import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { ChainController, ConnectorController, RouterController } from '@reown/appkit-controllers'
import { type VisualType, customElement } from '@reown/appkit-ui'

import styles from './styles.js'

const chainIconNameMap: Record<ChainNamespace, VisualType> = {
  eip155: 'eth',
  solana: 'solana',
  bip122: 'bitcoin',
  // @ts-expect-error we don't have Polkadot implemented yet
  polkadot: undefined
}

@customElement('w3m-switch-active-chain-view')
export class W3mSwitchActiveChainView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  protected readonly switchToChain = RouterController.state.data?.switchToChain

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

    const nextChainName = ConstantsUtil.CHAIN_NAME_MAP[this.switchToChain]

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['4', '2', '2', '2'] as const}
        gap="4"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="2">
          <wui-visual
            size="md"
            name=${ifDefined(chainIconNameMap[this.switchToChain])}
          ></wui-visual>
          <wui-flex gap="2" flexDirection="column" alignItems="center">
            <wui-text
              data-testid=${`w3m-switch-active-chain-to-${nextChainName}`}
              variant="lg-regular"
              color="primary"
              align="center"
              >Switch to <span class="capitalize">${nextChainName}</span></wui-text
            >
            <wui-text variant="md-regular" color="secondary" align="center">
              Connected wallet doesn't support connecting to ${switchedChainNameString} chain. You
              need to connect with a different wallet.
            </wui-text>
          </wui-flex>
          <wui-button
            data-testid="w3m-switch-active-chain-button"
            size="md"
            @click=${this.switchActiveChain.bind(this)}
            >Switch</wui-button
          >
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ------------------------------------ //
  private async switchActiveChain() {
    if (!this.switchToChain) {
      return
    }

    ChainController.setIsSwitchingNamespace(true)
    ConnectorController.setFilterByNamespace(this.switchToChain)

    if (this.caipNetwork) {
      await ChainController.switchActiveNetwork(this.caipNetwork)
    } else {
      ChainController.setActiveNamespace(this.switchToChain)
    }

    RouterController.reset('Connect')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-active-chain-view': W3mSwitchActiveChainView
  }
}
