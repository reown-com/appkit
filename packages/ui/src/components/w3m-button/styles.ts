import { html } from 'lit'
import { scss } from '../../style/utils'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'

// -- static styles ------------------------------------------------ //
export default scss`
  ${scssStyles}
`

// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, background, overlay } = color()

  return html`<style>
    .w3m-button-fill {
      background-color: ${foreground.accent};
    }

    .w3m-button-ghost {
      background-color: ${background.accent};
    }

    .w3m-button::after {
      border: 1px solid ${overlay.thin};
    }

    .w3m-button:hover::after {
      background-color: ${overlay.thin};
    }

    .w3m-button:disabled {
      background-color: ${background[3]};
    }

    .w3m-button-fill path {
      fill: ${foreground.inverse};
    }

    .w3m-button-ghost path {
      fill: ${foreground.accent};
    }
  </style>`
}
