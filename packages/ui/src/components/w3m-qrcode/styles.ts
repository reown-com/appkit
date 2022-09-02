import { css } from 'lit'

export default css`
  .w3m-qrcode-container {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1/1;
  }

  .w3m-qrcode-container svg:first-child,
  .w3m-qrcode-container w3m-wallet-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  w3m-wallet-image {
    width: 25%;
    height: 25%;
    border-radius: 22px;
  }

  .w3m-qrcode-container svg:first-child {
    width: 25%;
  }
`
