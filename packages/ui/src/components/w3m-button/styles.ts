import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  .w3m-button {
    display: flex;
    border-radius: 28px;
    justify-content: center;
    align-items: center;
    height: 28px;
    padding: 0 10px;
    border: none;
    cursor: pointer;
    position: relative;
  }

  .w3m-button::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 28px;
    background-color: transparent;
    transition: background-color, 0.2s ease-in-out;
  }

  svg,
  w3m-text {
    position: relative;
    z-index: 1;
  }
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
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    .w3m-button-fill:hover::after {
      background-color: ${overlay.thick};
    }

    .w3m-button-ghost:hover::after {
      background-color: ${overlay.thin};
    }
  </style>`
}
