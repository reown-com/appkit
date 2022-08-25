import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  button {
    border: none;
    transition: 0.2s filter ease-in-out;
    padding: 0 15px 1px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  button::before {
    content: '';
    inset: 0;
    position: absolute;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  button:hover::before {
    opacity: 1;
  }

  button:disabled {
    cursor: not-allowed;
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

  svg,
  w3m-text {
    position: relative;
    z-index: 1;
  }
`

// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, background, overlay } = color()

  return html` <style>
    button {
      color: ${foreground.inverse};
      background-color: ${foreground.accent};
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    button::before {
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
  </style>`
}
