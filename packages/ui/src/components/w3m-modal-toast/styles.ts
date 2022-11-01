import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-modal-toast {
    height: 36px;
    width: max-content;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
    position: absolute;
    top: 12px;
    box-shadow: 0px 6px 14px -6px rgba(10, 16, 31, 0.3), 0px 10px 32px -4px rgba(10, 16, 31, 0.15);
    z-index: 2;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-radius: 36px;
    background-color: rgba(39, 42, 42, 0.66);
  }

  .w3m-modal-toast svg {
    margin-right: 5px;
  }
`

export function dynamicStyles() {
  const { foreground, error, overlay } = color()

  return html`<style>
    .w3m-modal-toast {
      border: 1px solid ${overlay.thin};
    }

    .w3m-success path {
      fill: ${foreground.accent};
    }

    .w3m-error path {
      fill: ${error};
    }
  </style>`
}
