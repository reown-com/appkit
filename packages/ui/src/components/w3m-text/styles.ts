import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { foreground, error } = color()

  return html`<style>
    :host(*) {
      color: ${foreground[1]};
    }

    .w3m-color-primary {
      color: ${foreground[1]};
    }

    .w3m-color-secondary {
      color: ${foreground[2]};
    }

    .w3m-color-tertiary {
      color: ${foreground[3]};
    }

    .w3m-color-inverse {
      color: ${foreground.inverse};
    }

    .w3m-color-accnt {
      color: ${foreground.accent};
    }

    .w3m-color-error {
      color: ${error};
    }
  </style>`
}
