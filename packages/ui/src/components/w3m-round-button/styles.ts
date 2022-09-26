import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  button {
    padding: 0;
    border: none;
    background: none;
  }

  button:disabled {
    padding-bottom: 0;
  }

  .w3m-footer-actions {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
  }

  .w3m-rounded-button-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 4px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
  }

  .w3m-rounded-button-container :hover {
    opacity: 0.5;
  }
`
// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground } = color()

  return html` <style>
    button {
      color: ${foreground.inverse};
      background-color: ${foreground.accent};
    }

    .w3m-rounded-button-container {
      background-color: ${foreground.accent};
    }
  </style>`
}
