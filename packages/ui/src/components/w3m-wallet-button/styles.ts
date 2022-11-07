import { ConfigCtrl } from '@web3modal/core'
import { html } from 'lit'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const isDark = ConfigCtrl.state.theme === 'dark'

  return html`
    <style>
      .w3m-wallet-button:hover w3m-wallet-image {
        filter: brightness(${isDark ? '110%' : '104%'});
      }
    </style>
  `
}
