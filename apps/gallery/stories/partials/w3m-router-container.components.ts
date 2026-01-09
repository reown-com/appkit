import { html } from 'lit'

import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'

export function connectPage() {
  return html`
    <wui-flex flexDirection="column" justifyContent="flex-start" gap="2" width="100%" height="100%">
      <wui-flex flexDirection="column" padding="4">
        <w3m-list-wallet
          name="MetaMask"
          imageSrc="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b"
          tagLabel="Recent"
          tagVariant="accent"
        ></w3m-list-wallet>
        <w3m-list-wallet
          name="Rainbow"
          imageSrc="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b"
          tagLabel="Injected"
          tagVariant="success"
        ></w3m-list-wallet
        ><w3m-list-wallet
          name="Trust"
          imageSrc="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b"
          tagLabel="Multichain"
          tagVariant="info"
        ></w3m-list-wallet
        ><w3m-list-wallet
          name="Coinbase"
          imageSrc="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b"
          tagLabel="Multichain"
          tagVariant="info"
        ></w3m-list-wallet>
      </wui-flex>
    </wui-flex>
  `
}

export function connectingPage() {
  return html`
    <wui-flex
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      padding="4"
      gap="2"
      width="100%"
      height="100%"
    >
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        <wui-icon
          icon="wallet"
          size="xl"
          color="accent-primary"
          style="width: 48px; margin-bottom: 32px;"
        ></wui-icon>
        <wui-flex flexDirection="column" alignItems="center" gap="4">
          <wui-text variant="lg-medium" color="primary" align="center"
            >Connecting to MetaMask</wui-text
          >
          <wui-text variant="lg-regular" color="primary" align="center"
            >Please approve the request in your wallet</wui-text
          >
          <wui-button size="sm" variant="accent-primary">Cancel</wui-button>
        </wui-flex>
      </wui-flex>
    </wui-flex>
  `
}

export function settingsPage() {
  return html`
    <wui-flex
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      padding="4"
      gap="2"
      width="100%"
      height="100%"
    >
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        <wui-icon
          icon="wallet"
          size="xl"
          color="accent-primary"
          style="width: 48px; margin-bottom: 32px;"
        ></wui-icon>
        <wui-flex flexDirection="column" alignItems="center" gap="4">
          <wui-text variant="lg-medium" color="primary" align="center">Settings</wui-text>
          <wui-list-item text="Settings 1" subtext="Settings" icon="allWallets"></wui-list-item>
        </wui-flex>
      </wui-flex>
    </wui-flex>
  `
}
