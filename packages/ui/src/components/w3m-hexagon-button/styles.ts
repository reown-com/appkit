import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  button {
    padding: 0;
    border: none;
    background: none;
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

  .w3m-hex {
    width: 32px;
    display: inline-block;
    margin: 0 5px;
    color: red;
    filter: url('#goo');
  }

  .w3m-hex::before {
    content: '';
    display: block;
    background: currentColor;
    padding-top: 115%; /* 100%/cos(30)  */
    clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  }
`
// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  // const { background, foreground, overlay } = color()
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
