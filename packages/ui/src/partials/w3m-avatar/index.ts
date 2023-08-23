import { AccountCtrl } from '@web3modal/core'
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

  @state() private avatar?: string | null = undefined

  @state() private loading = true

  @property() public size?: 'medium' | 'small' = 'small'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.address = AccountCtrl.state.address
    this.avatar = AccountCtrl.state.profileAvatar
    this.loading = Boolean(AccountCtrl.state.profileLoading)
    this.unsubscribeAccount = AccountCtrl.subscribe(
      ({ address, profileAvatar, profileLoading }) => {
        this.address = address
        this.avatar = profileAvatar
        this.loading = Boolean(profileLoading)
      }
    )
  }

  public disconnectedCallback() {
    this.unsubscribeAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeAccount?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-placeholder': true,
      'w3m-small': this.size === 'small',
      'w3m-medium': this.size === 'medium'
    }

    if (this.avatar) {
      return html`<img
        crossorigin="anonymous"
        class=${classMap(classes)}
        src=${this.avatar}
        data-testid="partial-avatar-image"
      />`
    }

    if (this.address) {
      UiUtil.generateAvatarColors(this.address)

      return html`
        <div class=${classMap(classes)}>
          ${this.loading ? html`<div class="w3m-loader"></div>` : null}
        </div>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-avatar': W3mAvatar
  }
}
