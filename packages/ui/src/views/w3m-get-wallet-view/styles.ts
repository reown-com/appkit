import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-info-text {
    margin: 5px 0 15px;
    max-width: 320px;
  }

  .w3m-walle-item {
    margin: 0 -18px 0 0;
    padding-right: 18px;
    display: flex;
    align-items: center;
  }

  .w3m-walle-item:last-child .w3m-wallet-content {
    border-bottom: none;
  }

  .w3m-walle-item:last-child {
    margin-bottom: -18px;
  }

  .w3m-walle-item:first-child {
    margin-top: -18px;
  }

  .w3m-wallet-content {
    margin-left: 18px;
    height: 60px;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
  }

  .w3m-footer-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  w3m-wallet-image {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 14px;
  }
`

export function dynamicStyles() {
  const { background } = color()

  return html`<style>
    .w3m-walle-item {
      border-bottom: 1px solid ${background[2]};
    }
  </style>`
}
