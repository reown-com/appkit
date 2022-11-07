import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-title path {
      fill: ${foreground[1]};
    }
  </style>`
}
