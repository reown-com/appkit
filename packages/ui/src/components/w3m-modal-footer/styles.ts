import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { background } = color()

  return html`<style>
    .w3m-modal-footer {
      border-top: 1px solid ${background[2]};
    }
  </style>`
}
