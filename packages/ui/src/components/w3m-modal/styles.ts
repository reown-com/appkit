import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { overlay, background, foreground } = color()

  return html`<style>
    .w3m-modal-card {
      box-shadow: 0px 6px 14px -6px rgba(10, 16, 31, 0.12), 0px 10px 32px -4px rgba(10, 16, 31, 0.1),
        0 0 0 1px ${overlay.thin};
      background-color: ${background[1]};
      color: ${foreground[1]};
    }
  </style>`
}
