import { css, unsafeCSS } from 'lit'
import { color } from '../../utils/Theme'

const contentShadowLight = unsafeCSS(color().light.overlay.thin)
const contentShadowDark = unsafeCSS(color().dark.overlay.thin)
const closeBtnBgDark = unsafeCSS(color().dark.background[1])
const closeBtnBgLight = unsafeCSS(color().light.background[1])

export default css`
  .w3m-gradient-canvas,
  .w3m-modal-highlight,
  #w3m-transparent-noise {
    inset: 0;
    position: absolute;
    display: block;
    pointer-events: none;
    width: 100%;
    height: 100%;
    border-radius: 8px 8px 30px 8px;
    transform: translate3d(-5px, -5px, 0);
  }

  .w3m-gradient-canvas {
    backface-visibility: none;
    --gradient-color-1: #cad8f2;
    --gradient-color-2: #be3620;
    --gradient-color-3: #a6208c;
    --gradient-color-4: #06968f;
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
  }

  .w3m-modal-close-btn svg {
    width: 12px;
    height: 12px;
    display: block;
  }

  @media (prefers-color-scheme: dark) {
    .w3m-modal-highlight {
      border: 1px solid ${contentShadowDark};
    }

    .w3m-modal-close-btn {
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
      background-color: ${closeBtnBgDark};
    }
  }

  @media (prefers-color-scheme: light) {
    .w3m-modal-highlight {
      border: 1px solid ${contentShadowLight};
    }

    .w3m-modal-close-btn {
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      background-color: ${closeBtnBgLight};
    }
  }
`
