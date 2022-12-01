import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-avatar')
export class W3mAvatar extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address?: string = undefined
  @property() public size?: 'medium' | 'small' = 'small'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.address = ClientCtrl.client().getAccount().address
    this.accountUnsub = ClientCtrl.client().watchAccount(accountState => {
      this.address = accountState.address
    })
  }

  public disconnectedCallback() {
    this.accountUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly accountUnsub?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-avatar': true,
      'w3m-avatar-small': this.size === 'small',
      'w3m-avatar-medium': this.size === 'medium'
    }

    if (this.address) {
      UiUtil.generateAvatarColors(this.address)

      return html`<div class=${classMap(classes)}></div>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-avatar': W3mAvatar
  }
}
