import { ConfigCtrl } from '@web3modal/core'
import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-button {
    display: flex;
    flex-direction: column;
    background-color: transparent;
  }

  .w3m-icons {
    width: 60px;
    height: 60px;
    display: flex;
    flex-wrap: wrap;
    padding: 7px;
    border-radius: 15px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    transition: all 0.2s ease-in-out;
  }

  .w3m-button:hover .w3m-icons {
    transform: translateY(-2px);
  }

  .w3m-icons img {
    width: 21px;
    height: 21px;
    object-fit: cover;
    object-position: center;
    border-radius: 8px;
  }

  .w3m-icons svg {
    width: 21px;
    height: 21px;
  }

  .w3m-icons img:nth-child(1),
  .w3m-icons img:nth-child(2),
  .w3m-icons svg:nth-child(1),
  .w3m-icons svg:nth-child(2) {
    margin-bottom: 4px;
  }

  w3m-text {
    width: 100%;
    text-align: center;
  }
`

export function dynamicStyles() {
  const { background, overlay } = color()
  const isDark = ConfigCtrl.state.theme === 'dark'

  return html`
    <style>
      .w3m-icons {
        background-color: ${background.accent};
        box-shadow: inset 0 0 0 1px ${overlay.thin};
      }

      .w3m-button:hover .w3m-icons {
        filter: brightness(${isDark ? '110%' : '104%'});
      }

      .w3m-icons img {
        border: 1px solid ${overlay.thin};
      }

      #wallet-placeholder-fill {
        fill: ${background[3]};
      }

      #wallet-placeholder-dash {
        stroke: ${overlay.thin};
      }
    </style>
  `
}
