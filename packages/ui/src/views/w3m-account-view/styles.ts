import { css } from 'lit'

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
`
