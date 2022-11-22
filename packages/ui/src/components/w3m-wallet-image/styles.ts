import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-wallet-image {
    overflow: hidden;
    position: relative;
    border-radius: inherit;
    width: 100%;
    height: 100%;
  }

  svg {
    position: relative;
    width: 100%;
    height: 100%;
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
  const { overlay, background } = color()

  return html` <style>
    .w3m-wallet-image::after {
      border: 1px solid ${overlay.thin};
    }

    #wallet-placeholder-fill {
      fill: ${background[3]};
    }

    #wallet-placeholder-dash {
      stroke: ${overlay.thin};
    }
  </style>`
}
