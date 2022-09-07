import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-info-text {
    margin: 10px 0 22px;
    max-width: 320px;
  }

  .w3m-walle-item {
    display: flex;
    align-items: center;
  }

  .w3m-wallet-content {
    width: 100%;
    margin: 0 -18px 0 15px;
    padding-right: 18px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  w3m-modal-content {
    padding-right: 0;
  }

  w3m-wallet-image {
    display: block;
    max-width: 48px;
    max-height: 48px;
    border-radius: 14px;
  }
`

export function dynamicStyles() {
  const { background } = color()

  return html`<style>
    .w3m-wallet-content {
      border-bottom: 1px solid ${background[3]};
    }

    .w3m-walle-item:last-child .w3m-wallet-content {
      border-bottom: none;
    }

    .w3m-walle-item:last-child {
      margin-bottom: -18px;
    }
  </style>`
}
