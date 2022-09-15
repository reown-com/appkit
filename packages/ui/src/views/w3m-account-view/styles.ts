import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  button {
    width: 100%;
    border: none;
  }

  .w3m-flex-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  w3m-ens-image {
    border-radius: 22px;
    width: 25%;
    aspect-ratio: 1 / 1;
    margin-bottom: 4px;
  }

  w3m-ens-address-container {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .w3m-address-ens-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 24px;
  }

  .w3m-space-between-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 24px;
  }

  .w3m-spread-between-container {
    display: flex;
    flex: 1;
    justify-content: spread-between;
    padding: 24px;
  }

  .w3m-footer-action-container {
    display: flex;
    flex: 1;
    width: 100%;
    justify-content: spread-between;
  }

  .w3m-footer-actions {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
  }
`

// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, background, overlay } = color()

  return html` <style>
    button {
      background-color: 'transparent';
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
  </style>`
}
