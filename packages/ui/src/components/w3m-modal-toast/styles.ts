import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { foreground, error, background, overlay } = color()

  return html`<style>
    .w3m-modal-toast {
      border: 1px solid ${overlay.thin};
      background-color: ${overlay.thin};
    }

    @-moz-document url-prefix() {
      .w3m-modal-toast {
        background-color: ${background.accent};
      }
    }

    .w3m-success path {
      fill: ${foreground.accent};
    }

    .w3m-error path {
      fill: ${error};
    }
  </style>`
}
