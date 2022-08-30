import { css, unsafeCSS } from 'lit'
import { color } from '../../utils/Theme'

const cardShadow = unsafeCSS(color().overlay.thin)
const cardBg = unsafeCSS(color().background[1])
const cardColor = unsafeCSS(color().foreground[1])

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

  .w3m-modal-card {
    width: 100%;
    position: relative;
    transform: translate3d(5px, 5px, 0);
    border-radius: 40px;
    box-shadow: 0 0 0 1px ${cardShadow};
    background-color: ${cardBg};
    color: ${cardColor};
    overflow: hidden;
  }
`
