import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-wallet-button {
    background-color: transparent;
    border-radius: 18px;
    margin-bottom: 5px;
    overflow: hidden;
    height: 60px;
    width: 60px;
  }

  .w3m-wallet-button::after {
    position: absolute;
    border-radius: 18px;
    inset: 0;
  }

  .w3m-wallet-button img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .w3m-wallet-button-wrap {
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  w3m-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }
`

export function dynamicStyles() {
  const { overlay } = color()

  return html`<style>
    .w3m-wallet-button::after {
      border: 1px solid ${overlay.thin};
    }
  </style>`
}
