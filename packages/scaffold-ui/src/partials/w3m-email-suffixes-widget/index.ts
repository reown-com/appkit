import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { customElement } from '@reown/appkit-ui'

import styles from './styles.js'

const options = [
  '@gmail.com',
  '@outlook.com',
  '@yahoo.com',
  '@hotmail.com',
  '@aol.com',
  '@icloud.com',
  '@zoho.com'
]

@customElement('w3m-email-suffixes-widget')
export class W3mEmailSuffixesWidget extends LitElement {
  public static override styles = [styles]

  @property() public email = ''

  public override render() {
    const items = options.filter(this.filter.bind(this)).map(this.item.bind(this))

    if (items.length === 0) {
      return null
    }

    return html`<div class="email-sufixes">${items}</div>`
  }

  private filter(option: string) {
    if (!this.email) {
      return false
    }

    const pieces = this.email.split('@')

    if (pieces.length < 2) {
      return true
    }
    const host = pieces.pop() as string

    return option.includes(host) && option !== `@${host}`
  }

  private item(option: string) {
    const handleClick = () => {
      const pieces = this.email.split('@')
      if (pieces.length > 1) {
        pieces.pop()
      }
      const newEmail = pieces[0] + option

      // Dispatch custom event to notify parent component
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: newEmail,
          bubbles: true,
          composed: true
        })
      )
    }

    return html`<wui-button variant="neutral" size="sm" @click=${handleClick}
      >${option}</wui-button
    >`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-suffixes-widget': W3mEmailSuffixesWidget
  }
}
