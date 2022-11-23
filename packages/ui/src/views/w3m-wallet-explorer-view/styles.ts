import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  w3m-modal-content {
    display: flex;
    height: 55vh;
    overflow: scroll;
    scrollbar-width: none;
    position: relative;
    margin-top: 1px;
  }

  w3m-modal-content::before,
  w3m-modal-content::after {
    content: '';
    position: fixed;
    pointer-events: none;
    z-index: 1;
    width: 100%;
    height: 18px;
    opacity: 1;
  }

  w3m-modal-content::-webkit-scrollbar {
    display: none;
  }

  .w3m-content {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-items: stretch;
  }

  .w3m-placeholder-block {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    overflow: hidden;
  }

  .w3m-loading .w3m-placeholder-block {
    height: 100%;
  }

  .w3m-end-reached .w3m-placeholder-block {
    height: 18px;
    opacity: 0;
  }

  .w3m-empty .w3m-placeholder-block {
    opacity: 1;
    height: 100%;
  }

  w3m-wallet-button {
    margin: calc((100% - 60px) / 3) 0;
  }
`

export function dynamicStyles() {
  const { background } = color()

  return html`
    <style>
      w3m-modal-content::before {
        box-shadow: 0 -1px 0 0 ${background[1]};
        background: linear-gradient(${background[1]}, transparent);
      }

      w3m-modal-content::after {
        box-shadow: 0 1px 0 0 ${background[1]};
        background: linear-gradient(transparent, ${background[1]});
        top: calc(100% - 18px);
      }
    </style>
  `
}
