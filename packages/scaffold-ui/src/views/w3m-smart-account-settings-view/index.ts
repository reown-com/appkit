import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  SendController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { ConnectorController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import { W3mFrameStorage } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

@customElement('w3m-smart-account-settings-view')
export class W3mSmartAccountSettingsView extends LitElement {
  @state() private loading = false

  @state() private switched = false

  @state() private text = ''

  @state() private network = ChainController.state.activeCaipNetwork

  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="2" .padding=${['6', '4', '3', '4'] as const}>
        ${this.togglePreferredAccountTypeTemplate()} ${this.toggleSmartAccountVersionTemplate()}
      </wui-flex>
    `
  }

  private toggleSmartAccountVersionTemplate() {
    return html`
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${true}
        ?chevron=${true}
        @click=${this.toggleSmartAccountVersion.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary"
          >Force smart account version to ${this.isV6() ? 'v7' : 'v6'}</wui-text
        >
      </wui-list-item>
    `
  }

  private isV6() {
    const currentVersion = W3mFrameStorage.get('dapp_smart_account_version') || 'v6'
    return currentVersion === 'v6'
  }

  private toggleSmartAccountVersion() {
    W3mFrameStorage.set('dapp_smart_account_version', this.isV6() ? 'v7' : 'v6')
    if (typeof window !== 'undefined') {
      window?.location?.reload()
    }
  }

  private togglePreferredAccountTypeTemplate() {
    const namespace = this.network?.chainNamespace
    const isNetworkEnabled = ChainController.checkIfSmartAccountEnabled()
    const connectorId = ConnectorController.getConnectorId(namespace)
    const authConnector = ConnectorController.getAuthConnector()
    if (!authConnector || connectorId !== ConstantsUtil.CONNECTOR_ID.AUTH || !isNetworkEnabled) {
      return null
    }

    if (!this.switched) {
      this.text =
        getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
          ? 'Switch to your EOA'
          : 'Switch to your Smart Account'
    }

    return html`
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${true}
        ?chevron=${true}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      </wui-list-item>
    `
  }

  private async changePreferredAccountType() {
    const namespace = this.network?.chainNamespace
    const isSmartAccountEnabled = ChainController.checkIfSmartAccountEnabled()
    const accountTypeTarget =
      getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT ||
      !isSmartAccountEnabled
        ? W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
        : W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    const authConnector = ConnectorController.getAuthConnector()

    if (!authConnector) {
      return
    }

    this.loading = true
    await ConnectionController.setPreferredAccountType(accountTypeTarget, namespace)

    this.text =
      accountTypeTarget === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        ? 'Switch to your EOA'
        : 'Switch to your Smart Account'
    this.switched = true

    SendController.resetSend()
    this.loading = false
    this.requestUpdate()
  }
}

/*
    if (!this.switched) {
      this.text =
        getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
          ? 'Switch to your EOA'
          : 'Switch to your Smart Account'
    }

    return html`
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${true}
        ?chevron=${true}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      </wui-list-item>
    `
    */
