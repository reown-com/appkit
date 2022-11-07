import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { overlay, background, foreground } = color()

  return html`<style>
    .w3m-gradient-placeholder {
      background: linear-gradient(#cad8f2, #be3620, #a6208c, #06968f);
    }

    .w3m-modal-highlight {
      border: 1px solid ${overlay.thin};
    }

    .w3m-modal-action-btn {
      background-color: ${background[1]};
    }

    .w3m-modal-action-btn:hover {
      background-color: ${background[2]};
    }

    .w3m-modal-action-btn path {
      fill: ${foreground[1]};
    }

    .w3m-modal-action-btn {
      box-shadow: 0 0 0 1px ${overlay.thin}, 0px 2px 4px -2px rgba(0, 0, 0, 0.12),
        0px 4px 4px -2px rgba(0, 0, 0, 0.08);
    }

    .w3m-help-active button:first-child {
      background-color: ${foreground.accent};
    }
  </style>`
}
