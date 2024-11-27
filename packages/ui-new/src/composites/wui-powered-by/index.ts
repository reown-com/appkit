import { html, LitElement, svg } from 'lit'
import { property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
 import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { vars } from '../../utils/ThemeHelperUtil.js'

@customElement('wui-powered-by')
export class WuiPoweredBy extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" justifyContent="center" columnGap="1">
        <wui-text variant="sm-regular" color="secondary">UX by</wui-text>
        ${this.logoTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private logoTemplate() {
    // We can't have this logo in <wui-icon> component since it doesn't fit 1/1 ratio
    return svg`<svg viewBox="0 0 60 16" fill="none">
  <path d="M9.33398 4.66667C9.33398 2.08934 11.4233 0 14.0007 0H20.6674C23.2447 0 25.334 2.08934 25.334 4.66667V11.3333C25.334 13.9106 23.2447 16 20.6674 16H14.0007C11.4233 16 9.33398 13.9106 9.33398 11.3333V4.66667Z" fill=${vars.tokens.theme.foregroundTertiary}/>
  <path d="M15.6055 10.9993L17.9448 4.66602H18.6316L16.2923 10.9993H15.6055Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M0 4.33333C0 1.9401 1.9401 0 4.33333 0C6.72657 0 8.66669 1.9401 8.66669 4.33333V11.6667C8.66669 14.0599 6.72657 16 4.33333 16C1.9401 16 0 14.0599 0 11.6667V4.33333Z" fill=${vars.tokens.theme.foregroundTertiary}/>
  <path d="M3.91602 9.99934V9.16602H4.74934V9.99934H3.91602Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M26 8C26 3.58172 29.3517 0 33.4863 0H52.5137C56.6483 0 60 3.58172 60 8C60 12.4183 56.6483 16 52.5137 16H33.4863C29.3517 16 26 12.4183 26 8Z" fill=${vars.tokens.theme.foregroundTertiary}/>
  <path d="M49.3691 9.95736V6.26135H50.0218V6.81868C50.2565 6.40801 50.7331 6.16602 51.2611 6.16602C52.0604 6.16602 52.6178 6.67201 52.6178 7.65469V9.95736H51.9725V7.69137C51.9725 7.04599 51.6058 6.70868 51.0704 6.70868C50.4911 6.70868 50.0218 7.1707 50.0218 7.82335V9.95736H49.3691Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M45.2543 9.95773L44.5723 6.26172H45.1882L45.6722 9.31242L46.3103 7.30306H46.9189L47.5496 9.29041L48.0409 6.26172H48.6569L47.9749 9.95773H47.2416L46.6182 8.03641L45.9876 9.95773H45.2543Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M42.3719 10.0527C41.2498 10.0527 40.5898 9.21668 40.5898 8.10932C40.5898 7.00938 41.2498 6.16602 42.3719 6.16602C43.4939 6.16602 44.1539 7.00938 44.1539 8.10932C44.1539 9.21668 43.4939 10.0527 42.3719 10.0527ZM42.3719 9.50999C43.1785 9.50999 43.4865 8.82066 43.4865 8.10199C43.4865 7.39065 43.1785 6.70868 42.3719 6.70868C41.5651 6.70868 41.2572 7.39065 41.2572 8.10199C41.2572 8.82066 41.5651 9.50999 42.3719 9.50999Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M38.281 10.0527C37.1957 10.0527 36.5137 9.22401 36.5137 8.10932C36.5137 7.00204 37.1957 6.16602 38.281 6.16602C39.1977 6.16602 40.0043 6.68668 39.9164 8.27799H37.181C37.2323 8.96005 37.5477 9.51732 38.281 9.51732C38.7723 9.51732 39.095 9.21668 39.205 8.87201H39.8503C39.7477 9.48805 39.1683 10.0527 38.281 10.0527ZM37.1957 7.78667H39.2857C39.2343 7.04599 38.8896 6.70135 38.281 6.70135C37.6137 6.70135 37.2837 7.18538 37.1957 7.78667Z" fill=${vars.tokens.theme.textPrimary}/>
  <path d="M33.3828 9.95773V6.26172H34.0501V6.88506C34.2848 6.47439 34.6882 6.26172 35.1061 6.26172H35.9935V6.88506H35.0548C34.4682 6.88506 34.0501 7.26638 34.0501 8.00706V9.95773H33.3828Z" fill=${vars.tokens.theme.textPrimary}/>
  </svg>
`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-powered-by': WuiPoweredBy
  }
}
