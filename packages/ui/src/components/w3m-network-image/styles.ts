import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { overlay } = color()

  return html` <style>
    .network-polygon-stroke {
      stroke: ${overlay.thin};
    }
  </style>`
}
