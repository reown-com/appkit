import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  CoreHelperUtil,
  EventsController,
  OnRampController,
  type OnRampProvider,
  RouterController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import '../../partials/w3m-onramp-provider-item/index.js'
import '../../partials/w3m-onramp-providers-footer/index.js'

@customElement('w3m-onramp-providers-view')
export class W3mOnRampProvidersView extends LitElement {
  private unsubscribe: (() => void)[] = []

  @state() private providers: OnRampProvider[] = OnRampController.state.providers

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('providers', val => {
          this.providers = val
        })
      ]
    )
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', '3', '3', '3']} gap="2">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onRampProvidersTemplate() {
    return this.providers
      .filter(provider =>
        provider.supportedChains.includes(ChainController.state.activeChain ?? 'eip155')
      )
      .map(
        provider => html`
          <w3m-onramp-provider-item
            label=${provider.label}
            name=${provider.name}
            feeRange=${provider.feeRange}
            @click=${() => {
              this.onClickProvider(provider)
            }}
            ?disabled=${!provider.url}
            data-testid=${`onramp-provider-${provider.name}`}
          ></w3m-onramp-provider-item>
        `
      )
  }

  private onClickProvider(provider: OnRampProvider) {
    OnRampController.setSelectedProvider(provider)
    RouterController.push('BuyInProgress')
    CoreHelperUtil.openHref(
      OnRampController.state.selectedProvider?.url || provider.url,
      'popupWindow',
      'width=600,height=800,scrollbars=yes'
    )
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_PROVIDER',
      properties: {
        provider: provider.name,
        isSmartAccount:
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-view': W3mOnRampProvidersView
  }
}
