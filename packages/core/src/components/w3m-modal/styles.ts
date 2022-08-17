import { css, unsafeCSS } from 'lit'
import color from '../../theme/color'

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
    opacity: 0;
    pointer-events: none;
  }

  .w3m-modal-open {
    pointer-events: auto;
  }

  .w3m-modal-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    max-height: 90vh;
  }

  .w3m-modal-content {
    width: 100%;
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
  }

  @media (prefers-color-scheme: light) {
    .w3m-modal-content {
      color: ${contentColorLight};
      background-color: ${contentBgLight}
      box-shadow: 0 0 0 1px ${contentShadowLight};
    }
  }
`
