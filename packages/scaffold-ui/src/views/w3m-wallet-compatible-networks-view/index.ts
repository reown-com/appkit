import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AccountController,
  AssetUtil,
  ChainController,
  CoreHelperUtil
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

  // -- State & Properties -------------------------------- //
  @state() private preferredAccountType = AccountController.state.preferredAccountType

  public constructor() {
    super()
    this.unsubscribe.push(
      AccountController.subscribeKey('preferredAccountType', val => {
        this.preferredAccountType = val
      })
    )
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
      this.preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    ) {
      if (!caipNetwork) {
        return null
      }
      sortedNetworks = [caipNetwork]
    }

    return sortedNetworks.map(
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
