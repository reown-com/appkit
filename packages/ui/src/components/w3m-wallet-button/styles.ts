import { css } from 'lit'

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
  }

  .w3m-wallet-button:hover w3m-wallet-image {
    transform: translateY(-2px);
    filter: brightness(110%);
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
