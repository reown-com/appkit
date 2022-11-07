import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, background, overlay } = color()

  return html` <style>
    button {
      color: ${foreground.inverse};
      background-color: ${foreground.accent};
    }

    button::after {
      border: 1px solid ${overlay.thin};
    }

    button:hover::after {
      background-color: ${overlay.thin};
    }

    button:disabled {
      background-color: ${background[3]};
      color: ${foreground[3]};
    }
  </style>`
}
