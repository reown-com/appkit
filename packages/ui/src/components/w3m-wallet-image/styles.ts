import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { overlay } = color()

  return html` <style>
    .w3m-wallet-image::after {
      border: 1px solid ${overlay.thin};
    }
  </style>`
}
