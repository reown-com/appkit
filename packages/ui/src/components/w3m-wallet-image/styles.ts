import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-wallet-image {
    overflow: hidden;
    position: relative;
    border-radius: inherit;
    width: inherit;
    height: inherit;
  }

  .w3m-wallet-image::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .w3m-wallet-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`

export function dynamicStyles() {
  const { overlay } = color()

  return html` <style>
    .w3m-wallet-image::after {
      border: 1px solid ${overlay.thin};
    }
  </style>`
}
