import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-network-image {
    position: relative;
    width: 54px;
    height: 59px;
  }

  .w3m-network-image svg {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  .w3m-network-image img {
    clip-path: url(#polygon);
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    position: absolute;
  }
`

export function dynamicStyles() {
  const { overlay } = color()

  return html` <style>
    .network-polygon-stroke {
      stroke: ${overlay.thin};
    }
  </style>`
}
