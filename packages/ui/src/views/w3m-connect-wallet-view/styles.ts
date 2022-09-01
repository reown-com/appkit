import { css } from 'lit'

export default css`
  .w3m-view-row {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 40px;
    width: 100%;
    justify-content: space-between;
  }

  .w3m-view-row:first-child {
    margin-bottom: 15px;
  }

  w3m-walletconnect-button {
    width: 100%;
    overflow: hidden;
  }
`
