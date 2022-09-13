import { css } from 'lit'

export default css`
  .w3m-view-row {
    display: flex;
    width: calc(100% + 36px);
    justify-content: space-between;
    overflow-x: scroll;
    scrollbar-width: none;
    margin: 0 -18px;
    padding: 0 8px;
  }

  .w3m-view-row::-webkit-scrollbar {
    display: none;
  }

  w3m-wallet-button {
    margin: 0 10px;
  }
`
