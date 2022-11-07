import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { foreground, background } = color()

  return html`<style>
    .w3m-modal-header {
      border-bottom: 1px solid ${background[2]};
    }

    .w3m-back-btn path,
    .w3m-action-btn path {
      fill: ${foreground.accent};
    }
  </style>`
}
