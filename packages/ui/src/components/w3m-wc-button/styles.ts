import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-wc-button {
    width: 100%;
    border-radius: 18px;
  }

  .w3m-wc-button-container {
    position: relative;
    width: 100%;
    height: 60px;
    border-radius: 18px;
    overflow: hidden;
  }

  .w3m-wc-button-container::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
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
    display: grid;
    grid-auto-flow: column;
    align-content: center;
    height: 100%;
    grid-gap: 10px;
    padding: 0 10px;
  }

  .w3m-wc-button-carousel-item {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: orange;
    overflow: hidden;
    position: relative;
  }

  .w3m-wc-button-carousel-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 10px;
  }

  .w3m-wc-button-carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`<style>
    .w3m-wc-button {
      background-color: ${background.accent};
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    .w3m-wc-button-logo svg:first-child path {
      fill: ${background.accent};
      stroke: ${background.accent};
    }

    .w3m-wc-button-carousel-item::after {
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    .w3m-wc-button-container::after {
      box-shadow: inset 15px 0 15px ${background.accent}, inset -15px 0 15px ${background.accent};
    }
  </style>`
}
