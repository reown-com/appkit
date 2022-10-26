import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-gradient-canvas,
  .w3m-modal-highlight,
  .w3m-gradient-placeholder,
  #w3m-transparent-noise {
    inset: 0;
    position: absolute;
    display: block;
    pointer-events: none;
    width: 100%;
    height: 100px;
    border-radius: 8px 8px 0 0;
    transform: translateY(-5px) translateX(0);
    top: 0;
    left: 0;
  }

  .w3m-gradient-canvas {
    --gradient-color-1: #cad8f2;
    --gradient-color-2: #be3620;
    --gradient-color-3: #a6208c;
    --gradient-color-4: #06968f;
    opacity: 0;
    transition: opacity 2s ease-in-out;
    box-shadow: 0px 8px 28px -6px rgba(10, 16, 31, 0.12), 0px 18px 88px -4px rgba(10, 16, 31, 0.14);
  }

  .w3m-gradient-canvas-visible {
    opacity: 1;
  }

  #w3m-transparent-noise {
    mix-blend-mode: multiply;
    opacity: 0.35;
  }

  .w3m-modal-toolbar {
    height: 28px;
    display: flex;
    position: relative;
    margin: 5px 15px 5px 5px;
    justify-content: space-between;
    align-items: center;
  }

  .w3m-modal-toolbar svg,
  .w3m-modal-toolbar img {
    height: 28px;
    object-position: left center;
    object-fit: contain;
  }

  .w3m-modal-close-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color, 0.2s ease-in-out;
  }

  .w3m-modal-close-btn svg {
    width: 12px;
    height: 12px;
    display: block;
  }
`

export function dynamicStyles() {
  const { overlay, background, foreground } = color()

  return html`<style>
    .w3m-gradient-placeholder {
      background: linear-gradient(#cad8f2, #be3620, #a6208c, #06968f);
    }

    .w3m-modal-highlight {
      border: 1px solid ${overlay.thin};
    }

    .w3m-modal-close-btn {
      background-color: ${background[1]};
    }

    .w3m-modal-close-btn:hover {
      background-color: ${background[2]};
    }

    .w3m-modal-close-btn path {
      fill: ${foreground[1]};
    }

    .w3m-modal-close-btn {
      box-shadow: 0 0 0 1px ${overlay.thin};
    }
  </style>`
}
