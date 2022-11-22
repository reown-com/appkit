import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-qrcode-container {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1/1;
  }

  .w3m-qrcode-container svg:first-child,
  .w3m-qrcode-container w3m-wallet-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  .w3m-qrcode-container w3m-wallet-image {
    transform: translateY(-50%) translateX(-50%);
  }

  w3m-wallet-image {
    width: 25%;
    height: 25%;
    border-radius: 15px;
  }

  .w3m-qrcode-container svg:first-child {
    transform: translateY(-50%) translateX(-50%) scale(0.9);
  }
`

export function dynamicStyles() {
  const { overlay, foreground } = color()

  return html`<style>
    .w3m-qrcode-container svg:first-child path:first-child {
      fill: ${foreground.accent};
    }

    .w3m-qrcode-container svg:first-child path:last-child {
      stroke: ${overlay.thin};
    }
  </style>`
}
