import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { background, overlay, foreground } = color()

  return html`<style>
    input {
      background-color: ${background[3]};
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    input:focus-within,
    input:not(:placeholder-shown) {
      color: ${foreground[1]};
    }

    input:focus-within {
      box-shadow: inset 0 0 0 1px ${foreground.accent};
    }

    path {
      fill: ${foreground[2]};
    }
  </style>`
}
