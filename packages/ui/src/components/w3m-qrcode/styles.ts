import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { overlay, foreground } = color()

  return html`<style>
    .w3m-qrcode-container svg:first-child path:first-child {
      fill: ${foreground.accent};
    }

    .w3m-qrcode-container svg:first-child path:last-child {
      stroke: ${overlay.thin};
    }
  </style>`
}
