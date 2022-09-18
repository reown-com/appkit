import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  button {
    padding: 0 15px 1px;
    height: 32px;
    border-radius: 16px;
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

  .w3m-button-loading {
    padding: 0 15px;
  }

  svg {
    width: 28px;
    height: 20px;
    margin: -1px 3px 0 -5px;
  }

  .w3m-act-button-container {
    width: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    padding: 8px 1px 8px 1px;
  }

  .w3m-act-balance-container {
    display: flex;
    justify-content: center;
    margin-right: 8px;
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

    .w3m-button-loading:disabled {
      background-color: ${background.accent};
    }

    button:disabled {
      background-color: ${background[3]};
      color: ${foreground[3]};
    }

    svg path {
      fill: ${foreground.inverse};
    }

    button:disabled svg path {
      fill: ${foreground[3]};
    }

    .w3m-act-button-container {
      color: ${foreground.inverse};
      background-color: ${background.accent};
      border: 1px solid ${overlay.thin};
    }
  </style>`
}
