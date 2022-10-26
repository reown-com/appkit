import { ConfigCtrl } from '@web3modal/core'
import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-network-button {
    background-color: transparent;
    padding: 5px;
    border-radius: 12px;
    transition: all 0.2s ease-in-out;
    margin: 10px 0;
  }

  .w3m-network-button-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
  }

  w3m-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    margin-top: 5px;
  }
`

export function dynamicStyles() {
  const isDark = ConfigCtrl.state.theme === 'dark'
  const { background, overlay } = color()

  return html`
    <style>
      .w3m-wallet-button:hover w3m-wallet-image {
        filter: brightness(${isDark ? '110%' : '104%'});
      }

      .w3m-network-button:hover {
        background-color: ${background.accent};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }
    </style>
  `
}
