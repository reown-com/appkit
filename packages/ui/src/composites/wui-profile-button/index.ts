import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-avatar/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-profile-button')
export class WuiProfileButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public networkSrc?: string = undefined

  @property() public avatarSrc?: string = undefined

  @property() public profileName?: string = ''

  @property() public address = ''

  @property() public icon: IconType = 'chevronBottom'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button data-testid="wui-profile-button">
      <wui-flex gap="2" alignItems="center">
        <wui-avatar
          .imageSrc=${this.avatarSrc}
          alt=${this.address}
          address=${this.address}
        ></wui-avatar>
        ${this.networkImageTemplate()}
        <wui-flex gap="1" alignItems="center">
          <wui-text variant="lg-medium" color="primary">
            ${UiHelperUtil.getTruncateString({
              string: this.profileName || this.address,
              charsStart: this.profileName ? 18 : 4,
              charsEnd: this.profileName ? 0 : 4,
              truncate: this.profileName ? 'end' : 'middle'
            })}
          </wui-text>
          <wui-icon size="sm" color="default" name=${this.icon}></wui-icon>
        </wui-flex>
      </wui-flex>
    </button>`
  }

  // -- Private ------------------------------------------- //
  private networkImageTemplate() {
    if (this.networkSrc) {
      return html`<wui-image src=${this.networkSrc}></wui-image>`
    }

    return html`
      <wui-icon-box size="lg" iconColor="default" icon="networkPlaceholder"></wui-icon-box>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-profile-button': WuiProfileButton
  }
}
