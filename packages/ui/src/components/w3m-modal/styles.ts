import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-modal-overlay {
    inset: 0;
    position: fixed;
    z-index: 10001;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
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
    transform: translateX(5px) translateY(5px);
    border-radius: 40px;
    overflow: hidden;
  }
`

export function dynamicStyles() {
  const { overlay, background, foreground } = color()

  return html`<style>
    .w3m-modal-card {
      box-shadow: 0 0 0 1px ${overlay.thin};
      background-color: ${background[1]};
      color: ${foreground[1]};
    }
  </style>`
}
