import { ConfigCtrl } from '@web3modal/core'
import { css, html } from 'lit'

export default css`
  .w3m-wallet-button-wrap {
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .w3m-wallet-button {
    background-color: transparent;
    width: 100%;
    height: 100%;
    text-decoration: none;
  }

  .w3m-wallet-button:hover w3m-wallet-image {
    transform: translateY(-2px);
  }

  w3m-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  w3m-wallet-image {
    height: 60px;
    width: 60px;
    transition: all 0.2s ease-in-out;
    border-radius: 18px;
    margin-bottom: 5px;
  }
`

export function dynamicStyles() {
  const isDark = ConfigCtrl.state.theme === 'dark'

  return html`
    <style>
      .w3m-wallet-button:hover w3m-wallet-image {
        filter: brightness(${isDark ? '110%' : '104%'});
      }
    </style>
  `
}
