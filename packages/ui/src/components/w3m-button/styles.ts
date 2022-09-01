import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  .w3m-button {
    border-radius: 28px;
    height: 28px;
    padding: 0 10px;
  }

  .w3m-button::after {
    border-radius: 28px;
  }

  .w3m-button:disabled::after {
    background-color: transparent;
  }

  .w3m-button-icon-left svg {
    margin-right: 5px;
  }

  .w3m-button-icon-right svg {
    margin-left: 5px;
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
