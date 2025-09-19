import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { ConnectorType, ConnectorWithProviders } from '@reown/appkit-controllers'
import {
  AssetUtil,
  ConnectorController,
  RouterController,
  StorageUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import type { TagVariant } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'

const VARIANTS: Record<ConnectorType, { tagVariant?: TagVariant; tagLabel?: string }> = {
  MULTI_CHAIN: {
    tagVariant: 'info',
    tagLabel: 'multichain'
  },
  INJECTED: {
    tagVariant: 'success',
    tagLabel: 'installed'
  },
  ANNOUNCED: {
    tagVariant: 'success',
    tagLabel: 'installed'
  },
  WALLET_CONNECT: {
    tagVariant: 'accent',
    tagLabel: 'QR Code'
  },
  EXTERNAL: {},
  AUTH: {}
}

@customElement('w3m-connector-item')
export class W3mConnectorItem extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @property() public connector: ConnectorWithProviders | undefined = undefined

  public constructor() {
    super()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.connector) {
      return null
    }

    if (!ConnectorUtil.showConnector(this.connector)) {
      return null
    }

    const { tagVariant, tagLabel } = this.getTagProps(this.connector)

    return html`
      <w3m-list-wallet
        imageSrc=${ifDefined(AssetUtil.getConnectorImage(this.connector))}
        name=${this.connector.name ?? 'Unknown'}
        tagVariant=${tagVariant}
        tagLabel=${tagLabel}
        data-testid=${`wallet-selector-${this.connector.id}`}
        size="sm"
        @click=${() => this.onConnector(this.connector)}
        tabIdx=${ifDefined(this.tabIdx)}
        rdnsId=${this.connector.explorerWallet?.rdns}
        walletRank=${this.connector.explorerWallet?.order}
      >
      </w3m-list-wallet>
    `
  }

  // -- Private Methods ----------------------------------- //
  private getTagProps(connector?: ConnectorWithProviders) {
    if (!connector) {
      return {}
    }

    const recent = StorageUtil.getRecentWallets().filter(wallet => wallet.id === connector.id)
    if (recent.find(wallet => wallet.id === this.connector?.id)) {
      return {
        tagVariant: 'accent',
        tagLabel: 'recent'
      }
    }

    const { tagVariant, tagLabel } = VARIANTS[connector.type]

    return {
      tagVariant,
      tagLabel
    }
  }
  private onConnector(connector?: ConnectorWithProviders) {
    if (!connector) {
      return
    }

    ConnectorController.setActiveConnector(connector)
    switch (connector.type) {
      case 'MULTI_CHAIN':
        RouterController.push('ConnectingMultiChain')
        break
      default:
        RouterController.push('ConnectingExternal', {
          connector,
          wallet: connector.explorerWallet
        })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-item': W3mConnectorItem
  }
}
