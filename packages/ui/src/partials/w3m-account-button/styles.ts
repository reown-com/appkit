import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  button {
    padding: 0 15px 1px;
    height: 40px;
    border-radius: 10px;
  }

  button::after {
    content: '';
    inset: 0;
    position: absolute;
    background-color: transparent;
    border-radius: inherit;
    transition: background-color 0.2s ease-in-out;
  }

  button:disabled {
    padding-bottom: 0;
  }
`

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
