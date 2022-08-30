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

  .w3m-back-btn {
    position: absolute;
    left: 0;
    background-color: transparent;
    padding-right: 10px;
    transition: opacity 0.2s ease-in-out;
  }

  .w3m-back-btn:hover {
    opacity: 0.6;
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
