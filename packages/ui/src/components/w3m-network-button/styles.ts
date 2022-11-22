import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-network-button {
    background-color: transparent;
    padding: 5px;
    border-radius: 12px;
    transition: all 0.2s ease-in-out;
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
  }

  w3m-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    margin-top: 5px;
  }

  svg {
    width: 100%;
    height: 100%;
    margin: 0;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()

  return html`
    <style>
      .w3m-network-button:hover {
        background-color: ${background.accent};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }

      #network-placeholder-fill {
        fill: ${background[3]};
      }

      #network-placeholder-dash {
        stroke: ${overlay.thin};
      }
    </style>
  `
}
