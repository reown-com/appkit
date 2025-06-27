import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-banner'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-network'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

@customElement('w3m-wallet-compatible-networks-view')
export class W3mWalletCompatibleNetworksView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  public constructor() {
    super()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex
      flexDirection="column"
      .padding=${['xs', 's', 'm', 's'] as const}
      gap="xs"
    >
      <wui-banner
        icon="warningCircle"
        text="You can only receive assets on these networks"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  networkTemplate() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()
    const caipNetwork = ChainController.state.activeCaipNetwork
    const isNetworkEnabledForSmartAccounts = ChainController.checkIfSmartAccountEnabled()

    let sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    // For now, each network has a unique account
    if (
      isNetworkEnabledForSmartAccounts &&
      getPreferredAccountType(caipNetwork?.chainNamespace as ChainNamespace) ===
        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    ) {
      if (!caipNetwork) {
        return null
      }
      sortedNetworks = [caipNetwork]
    }

    const namespaceNetworks = sortedNetworks.filter(
      network => network.chainNamespace === caipNetwork?.chainNamespace
    )

    return namespaceNetworks.map(
      network => html`
        <wui-list-network
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          name=${network.name ?? 'Unknown'}
          ?transparent=${true}
        >
        </wui-list-network>
      `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-compatible-networks-view': W3mWalletCompatibleNetworksView
  }
}
