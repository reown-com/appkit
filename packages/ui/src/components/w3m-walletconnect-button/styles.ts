import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  @keyframes ticker {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-500px);
    }
  }

  :host(:hover) .w3m-wc-button-logo {
    transform: translateY(-2px);
    filter: brightness(110%);
  }

  button {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: transparent;
  }

  .w3m-button-container {
    border-radius: 18px;
    margin-bottom: 5px;
    width: 100%;
    height: 60px;
    overflow: hidden;
    position: relative;
    display: flex;
  }

  .w3m-carousel-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    position: relative;
    margin: 0 5px;
  }

  .w3m-wc-button-logo {
    position: absolute;
    height: calc(100% - 2px);
    width: 100%;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;
    z-index: 1;
  }

  .w3m-wc-button-logo svg:first-child {
    position: absolute;
    transform: scale(2.4);
  }

  .w3m-wc-button-logo svg:last-child,
  .w3m-wc-button-logo svg:first-child {
    width: 69.4px;
    height: 48px;
  }

  .w3m-wc-button-carousel {
    display: flex;
  }

  .w3m-wc-button-carousel-item {
    animation: ticker 20s linear infinite;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin: 0 5px;
    overflow: hidden;
    position: relative;
  }

  .w3m-wc-button-carousel-item::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .w3m-wc-button-carousel-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .w3m-button-container::after,
  .w3m-button-container::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: 18px;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`
    <style>
      .w3m-button-container {
        background-color: ${background.accent};
        border: 1px solid ${overlay.thin};
      }

      .w3m-wc-button-logo svg:first-child path {
        fill: ${background.accent};
        stroke: ${background.accent};
      }

      .w3m-wc-button-carousel-item::after {
        border: 1px solid ${overlay.thin};
      }

      .w3m-button-container::after {
        box-shadow: inset 20px 0 10px 0 ${background.accent};
      }

      .w3m-button-container::before {
        box-shadow: inset -20px 0 10px 0 ${background.accent};
      }
    </style>
  `
}
