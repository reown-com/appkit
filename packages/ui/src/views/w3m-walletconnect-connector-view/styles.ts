import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-qr-container {
    width: 100%;
    aspect-ratio: 1 / 1;
  }

  .w3m-info-text {
    margin: 10px 0 22px;
    max-width: 320px;
  }

  .w3m-title {
    display: flex;
    align-items: center;
  }

  .w3m-title svg {
    margin-right: 8px;
  }
`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-title path {
      fill: ${foreground[1]};
    }
  </style>`
}
