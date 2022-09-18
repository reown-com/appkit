import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  button {
    padding: 0;
    border: none;
    background: none;
  }

  .w3m-flex-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  w3m-ens-image {
    border-radius: 22px;
    width: 25%;
    aspect-ratio: 1 / 1;
    margin-bottom: 4px;
  }

  w3m-ens-address-container {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .w3m-address-ens-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 24px;
  }

  .w3m-space-between-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 24px;
  }

  .w3m-balance-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
    padding: 11px 20px 11px 20px;
  }

  .w3m-spread-between-container {
    display: flex;
    flex: 1;
    justify-content: spread-between;
    padding: 24px;
  }

  .w3m-footer-action-container {
    display: flex;
    flex: 1;
    width: 100%;
    justify-content: spread-between;
  }

  .w3m-footer-actions {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
    align-items: center;
  }

  .w3m-account-divider {
    width: 100%;
    height: 1px;
  }

  .w3m-connected-container {
    border-radius: 28px;
    height: 28px;
    padding: 4px 10px 6px 10px;
    display: flex;
  }

  .w3m-token-bal-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .w3m-eth-logo-container {
    height: 28px;
    width: 28px;
    display: block;
    border-radius: 50%;
    margin-right: 7px;
  }

  .w3m-modal-close-btn svg {
    height: 28px;
    width: 28px;
    display: block;
  }

  .w3m-ens-avatar {
    overflow: hidden;
    position: relative;
    border-radius: 30px;
    width: 60px;
    height: 60px;
    margin-bottom: 10px;
  }
`
// -- dynamic styles ----------------------------------------------- //
export function dynamicStyles() {
  const { foreground, background, overlay } = color()

  return html` <style>
    .w3m-account-divider {
      background-color: ${background[2]};
    }

    .w3m-connected-container {
      background-color: ${background[2]};
      border: 1px solid ${overlay.thin};
    }

    .w3m-eth-logo-container {
      background-color: ${foreground[1]};
    }
  </style>`
}
