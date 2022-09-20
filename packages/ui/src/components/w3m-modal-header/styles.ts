import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-modal-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 18px 18px 0;
    position: relative;
  }

  .w3m-modal-header button {
    background-color: transparent;
    padding: 13px 17px;
    transition: opacity 0.2s ease-in-out;
  }

  .w3m-modal-header button:hover {
    opacity: 0.5;
  }

  .w3m-back-btn {
    position: absolute;
    left: 0;
    margin-left: -17px;
  }
`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-back-btn path {
      fill: ${foreground.accent};
    }
  </style>`
}
