import { ConfigCtrl } from '@web3modal/core'
import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { background, overlay } = color()
  const isDark = ConfigCtrl.state.theme === 'dark'

  return html`
    <style>
      .w3m-icons {
        background-color: ${background.accent};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }

      .w3m-button:hover .w3m-icons {
        filter: brightness(${isDark ? '110%' : '104%'});
      }

      .w3m-icons img {
        border: 1px solid ${overlay.thin};
      }
    </style>
  `
}
