import { css } from 'lit'

export default css`
  .w3m-wallet-button {
    background-color: transparent;
    border-radius: 18px;
    margin-bottom: 5px;
    height: 60px;
    width: 60px;
  }

  .w3m-wallet-button-wrap {
    width: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  w3m-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  w3m-wallet-image {
    border-radius: inherit;
  }
`
