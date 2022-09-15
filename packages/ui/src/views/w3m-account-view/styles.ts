import { css } from 'lit'

export default css`
  .w3m-flex-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  w3m-ens-image {
    border-radius: 22px;
    width: 25%;
    aspect-ratio: 1 / 1;
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
    padding: 24px 0px 24px;
  }

  .w3m-space-between-container {
    display: flex;
    flex: 1;
    justify-content: space-between;
  }
`
