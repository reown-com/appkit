import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  @keyframes scroll {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-350px, 0, 0);
    }
  }

  .w3m-wc-button {
    width: 100%;
    border-radius: 18px;
    margin-bottom: 5px;
  }

  .w3m-wc-button::after {
    position: absolute;
    border-radius: inherit;
    inset: 0;
  }

  .w3m-wc-button-container {
    position: relative;
    height: 60px;
    border-radius: inherit;
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
    transform: scale(2.4);
  }

  .w3m-wc-button-logo svg:last-child,
  .w3m-wc-button-logo svg:first-child {
    width: 69.4px;
    height: 48px;
  }

  .w3m-wc-button-carousel {
    display: grid;
    grid-auto-flow: column;
    align-content: center;
    height: 100%;
    grid-gap: 10px;
    padding: 0 15px;
  }

  .w3m-wc-button-carousel-item {
    animation: scroll 30s linear infinite;
    width: 40px;
    height: 40px;
    border-radius: 10px;
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

  .w3m-wc-button-carousel::after,
  .w3m-wc-button-container::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .w3m-wc-button-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`<style>
    .w3m-wc-button {
      background-color: ${background.accent};
    }

    .w3m-wc-button::after {
      border: 1px solid ${overlay.thin};
    }

    .w3m-wc-button-logo svg:first-child path {
      fill: ${background.accent};
      stroke: ${background.accent};
    }

    .w3m-wc-button-carousel-item::after {
      border: 1px solid ${overlay.thin};
    }

    .w3m-wc-button-carousel::after,
    .w3m-wc-button-container::after {
      box-shadow: inset 15px 0 15px ${background.accent}, inset -15px 0 15px ${background.accent};
    }
  </style>`
}
