import { css, html } from 'lit'
import { color } from '../../utils/Theme'

// -- static styles ------------------------------------------------ //
export default css`
  button {
    padding: 8px;
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
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
  }

  .w3m-address-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px 1px;
    height: 32px;
    border-radius: 16px;
  }

  .w3m-act-balance-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
  }

  .w3m-eth-logo-container {
    height: 24px;
    width: 24px;
    display: block;
    border-radius: 50%;
    margin-right: 7px;
  }

  .w3m-eth-logo-container svg {
    position: relative;
    top: 1px;
    left: 5px;
    height: 24px;
    width: 24px;
    display: block;
  }

  .w3m-chevron-container {
    transform: rotate(180deg);
    height: 18px;
    width: 6px;
    display: block;
    padding-right: 4px;
  }

  .w3m-chevron-container svg {
    height: 18px;
    width: 6px;
  }

  .w3m-ens-zorb-container {
    padding: 4px 4px 0px;
    margin-left: -10px;
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

    button:disabled svg path {
      fill: ${foreground[3]};
    }

    .w3m-act-button-container {
      color: ${foreground.inverse};
      background-color: ${background.accent};
      border: 1px solid ${overlay.thin};
    }

    .w3m-address-container {
      color: ${foreground.inverse};
      background-color: ${foreground.accent};
      border: 1px solid ${overlay.thin};
    }

    .w3m-eth-logo-container {
      background-color: ${foreground[1]};
    }

    .w3m-chevron-container path {
      fill: ${foreground.inverse};
    }
  </style>`
}
