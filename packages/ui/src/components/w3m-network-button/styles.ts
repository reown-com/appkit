import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`
    <style>
      .w3m-network-button:hover {
        background-color: ${background.accent};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }
    </style>
  `
}
