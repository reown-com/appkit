import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-token-bal-container {
    display: flex;
    justify-content: center;
    align-items: center;
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
    height: 24px;
    width: 24px;
  }
`

// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, overlay } = color()

  return html` <style>
    .w3m-eth-logo-container {
      background-color: ${foreground[1]};
      border: 1px solid: ${overlay.thin}
    }
  </style>`
}
