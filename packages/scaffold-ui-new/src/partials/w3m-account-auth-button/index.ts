import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'

import {
  ConnectorController,
  RouterController,
  StorageUtil,
  type SocialProvider
} from '@reown/appkit-core'

@customElement('w3m-account-auth-button')
export class W3mAccountAuthButton extends LitElement {
  // -- Members ------------------------------------------- //
  private socialProvider = StorageUtil.getConnectedSocialProvider() as SocialProvider | null

  private socialUsername = StorageUtil.getConnectedSocialUsername()

  // -- Render -------------------------------------------- //
  public override render() {
    const type = StorageUtil.getConnectedConnector()
    const authConnector = ConnectorController.getAuthConnector()

    if (!authConnector || type !== 'ID_AUTH') {
      this.style.cssText = `display: none`

      return null
    }
    const email = authConnector.provider.getEmail() ?? ''

    return html`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon=${this.socialProvider ?? 'mail'}
        iconSize=${this.socialProvider ? 'xxl' : 'sm'}
        data-testid="w3m-account-email-update"
        ?chevron=${!this.socialProvider}
        @click=${() => {
          this.onGoToUpdateEmail(email, this.socialProvider)
        }}
      >
        <wui-text variant="paragraph-500" color="fg-100">${this.getAuthName(email)}</wui-text>
      </wui-list-item>
    `
  }

  // -- Private ------------------------------------------- //
  private onGoToUpdateEmail(email: string, socialProvider: SocialProvider | null) {
    if (!socialProvider) {
      RouterController.push('UpdateEmailWallet', { email })
    }
  }

  private getAuthName(email: string) {
    if (this.socialUsername) {
      if (this.socialProvider === 'discord' && this.socialUsername.endsWith('0')) {
        return this.socialUsername.slice(0, -1)
      }

      return this.socialUsername
    }

    return email.length > 30 ? `${email.slice(0, -3)}...` : email
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-auth-button': W3mAccountAuthButton
  }
}
