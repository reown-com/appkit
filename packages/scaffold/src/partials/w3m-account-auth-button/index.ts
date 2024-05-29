import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

import {
  ConnectorController,
  RouterController,
  StorageUtil,
  type SocialProvider
} from '@web3modal/core'

@customElement('w3m-account-auth-button')
export class W3mAccountAuthButton extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    const type = StorageUtil.getConnectedConnector()
    const authConnector = ConnectorController.getAuthConnector()

    if (!authConnector || type !== 'AUTH') {
      return null
    }
    const email = authConnector.provider.getEmail() ?? ''

    const socialProvider = StorageUtil.getConnectedSocialProvider() as SocialProvider | null

    const socialUsername = StorageUtil.getConnectedSocialUsername()

    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon=${socialProvider ?? 'mail'}
        iconSize=${socialProvider ? 'xxl' : 'sm'}
        data-testid="w3m-account-email-update"
        ?chevron=${!socialProvider}
        @click=${() => {
          this.onGoToUpdateEmail(email, socialProvider)
        }}
      >
        <wui-text variant="paragraph-500" color="fg-100">${socialUsername ?? email}</wui-text>
      </wui-list-item>
    `
  }

  // -- Private ------------------------------------------- //
  private onGoToUpdateEmail(email: string, socialProvider: SocialProvider | null) {
    if (!socialProvider) {
      RouterController.push('UpdateEmailWallet', { email })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-auth-button': W3mAccountAuthButton
  }
}
