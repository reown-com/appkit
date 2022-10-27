import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-network-image {
    position: relative;
    width: 54px;
    height: 59px;
  }

  .w3m-network-image svg,
  .w3m-network-image img {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }

  .w3m-network-image img {
    clip-path: url(#network-polygon);
    object-fit: cover;
    object-position: center;
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
