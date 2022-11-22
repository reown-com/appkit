import { css } from 'lit'

export default css`
  .w3m-injected-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1 / 1.25;
    flex-direction: column;
  }

  .w3m-connecting-title {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .w3m-install-title {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .w3m-install-title w3m-text:last-child {
    margin-top: 10px;
    max-width: 240px;
  }

  .w3m-install-actions {
    display: flex;
    margin-top: 20px;
  }

  @media (max-width: 355px) {
    .w3m-install-actions {
      flex-direction: column;
      align-items: center;
    }
  }

  w3m-spinner {
    margin-right: 10px;
  }

  w3m-wallet-image {
    border-radius: 15px;
    width: 25%;
    aspect-ratio: 1 / 1;
    margin-bottom: 20px;
  }

  w3m-button {
    opacity: 0;
  }

  .w3m-injected-error w3m-button {
    opacity: 1;
  }

  .w3m-install-actions w3m-button {
    margin: 5px;
    opacity: 1;
  }
`
