import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { customElement } from '@reown/appkit-ui'

import styles from './styles.js'

@customElement('w3m-recent-emails-widget')
export class W3mRecentEmailsWidget extends LitElement {
  public static override styles = [styles]

  @property() public emails: string[] = []

  public override render() {
    if (this.emails.length === 0) {
      return null
    }

    return html`<div class="recent-emails">
      <wui-text variant="micro-600" color="fg-200" class="recent-emails-heading"
        >Recently used emails</wui-text
      >
      ${this.emails.map(this.item.bind(this))}
    </div>`
  }

  private item(email: string) {
    const handleClick = () => {
      // Dispatch custom event to notify parent component
      this.dispatchEvent(
        new CustomEvent('select', {
          detail: email,
          bubbles: true,
          composed: true
        })
      )
    }

    return html`<wui-list-item
      @click=${handleClick}
      ?chevron=${true}
      icon="mail"
      iconVariant="overlay"
      class="recent-emails-list-item"
    >
      <wui-text variant="paragraph-500" color="fg-100">${email}</wui-text>
    </wui-list-item>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-recent-emails-widget': W3mRecentEmailsWidget
  }
}
