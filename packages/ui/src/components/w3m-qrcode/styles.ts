import { css } from 'lit'

export default css`
  .w3m-qrcode-container {
    position: relative;
    user-select: none;
    display: inline-block;
  }

  .w3m-qrcode-container svg:first-child,
  .w3m-qrcode-container img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .w3m-qrcode-container img {
    width: 25%;
    height: 25%;
    object-fit: cover;
    object-position: center;
  }

  .w3m-qrcode-container svg:first-child {
    width: 25%;
  }
`
