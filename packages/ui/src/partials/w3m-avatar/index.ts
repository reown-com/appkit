import { OptionsCtrl } from '@web3modal/core'
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
  @state() private profileAvatar?: string | null = undefined
  @property() public size?: 'medium' | 'small' = 'small'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.address = OptionsCtrl.state.address
    this.profileAvatar = OptionsCtrl.state.profileAvatar
    this.unsubscribeAccount = OptionsCtrl.subscribe(({ address, profileAvatar }) => {
      this.address = address
      this.profileAvatar = profileAvatar
    })
  }

  public disconnectedCallback() {
    this.unsubscribeAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeAccount?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-small': this.size === 'small',
      'w3m-medium': this.size === 'medium'
    }

    if (this.profileAvatar) {
      return html`<img class=${classMap(classes)} src=${this.profileAvatar} />`
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
