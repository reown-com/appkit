import { css } from 'lit'

export default css`
  .w3m-view-row {
    overflow-x: scroll;
    scrollbar-width: none;
    margin: 0 -18px;
    padding: 2px 0;
    display: flex;
    justify-content: space-between;
  }

  .w3m-view-row::-webkit-scrollbar {
    display: none;
  }

  w3m-wallet-button,
  w3m-view-all-wallets-button {
    padding: 0 10px;
  }

  w3m-wallet-button:first-child {
    padding-left: 18px;
  }

  w3m-view-all-wallets-button {
    padding-right: 18px;
  }
`
