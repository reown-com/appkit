import { css, unsafeCSS } from 'lit'
import color from '../../theme/color'

const contentShadowLight = unsafeCSS(color().light.overlay.thin)
const contentShadowDark = unsafeCSS(color().dark.overlay.thin)

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
    border-radius: 10px;
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

  @media (prefers-color-scheme: dark) {
    .w3m-modal-highlight {
      border: 1px solid ${contentShadowDark};
    }
  }

  @media (prefers-color-scheme: light) {
    .w3m-modal-highlight {
      border: 1px solid ${contentShadowLight};
    }
  }
`
