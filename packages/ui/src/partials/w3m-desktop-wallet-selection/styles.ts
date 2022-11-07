import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-mobile-title path,
    .w3m-desktop-title path {
      fill: ${foreground.accent};
    }

    .w3m-subtitle:last-child path {
      fill: ${foreground[3]};
    }
  </style>`
}
