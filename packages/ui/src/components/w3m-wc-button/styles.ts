import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-wc-button {
    width: 100%;
    background-color: transparent;
  }

  .w3m-wc-button-container {
    position: relative;
    width: 100%;
    height: 60px;
    border-radius: 18px;
    overflow: hidden;
  }

  .w3m-wc-button-logo {
    position: absolute;
    height: calc(100% - 2px);
    width: 100%;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .w3m-wc-button-logo svg:first-child {
    position: absolute;
    height: 100%;
    aspect-ratio: 1.45 / 1;
  }

  .w3m-wc-button-logo svg:last-child {
    width: 69.4px;
    height: 48px;
  }

  .w3m-wc-button-carousel {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .w3m-wc-button-carousel-item {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: orange;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`<style>
    .w3m-wc-button-container {
      background-color: ${background.accent};
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    .w3m-wc-button-logo svg:first-child path {
      fill: ${background.accent};
      stroke: ${background.accent};
    }
  </style>`
}
