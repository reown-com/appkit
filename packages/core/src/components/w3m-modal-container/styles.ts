import { css, unsafeCSS } from 'lit'
import color from '../../theme/colors'

const contentShadowLight = unsafeCSS(color().light.overlay.thin)
const contentShadowDark = unsafeCSS(color().dark.overlay.thin)
const contentBgLight = unsafeCSS(color().light.background[1])
const contentBgDark = unsafeCSS(color().dark.background[1])
const contentColorLight = unsafeCSS(color().light.foreground[1])
const contentColorDark = unsafeCSS(color().dark.foreground[1])

export default css`
  .w3m-modal-overlay {
    inset: 0;
    position: fixed;
    z-index: 10001;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .w3m-modal-container {
    position: relative;
    width: 400px;
    max-height: 90vh;
  }

  .w3m-modal-media, .w3m-modal-highlight, #w3m-transparent-noise {
    inset: 0;
    position: absolute;
    display: block;
    pointer-events: none;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    transform: translate3d(-5px, -5px, 0);
  }

  .w3m-modal-media {
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

  .w3m-modal-toolbar svg, .w3m-modal-toolbar img {
    height: 28px;
    object-position: left center;
    object-fit: contain;
  } 

  .w3m-modal-content {
    width: 400px;
    height: 80vh;
    position: relative;
    transform: translate3d(5px, 5px, 0);
    border-radius: 40px;
    padding: 20px;
  }

  @media (prefers-color-scheme: dark) {
    .w3m-modal-content {
      color: ${contentColorDark};
      background-color: ${contentBgDark}
      box-shadow: 0 0 0 1px ${contentShadowDark};
    }

    .w3m-modal-highlight {
      border: 1px solid ${contentShadowDark};
    }
  }

  @media (prefers-color-scheme: light) {
    .w3m-modal-content {
      color: ${contentColorLight};
      background-color: ${contentBgLight}
      box-shadow: 0 0 0 1px ${contentShadowLight};
    }

    .w3m-modal-highlight {
      border: 1px solid ${contentShadowLight};
    }
  }
`
