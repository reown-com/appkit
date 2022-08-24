import { css } from 'lit'

export default css`
  .w3m-qrcode-svg {
    aspect-ratio: 1;
    width: 100%;
  }

  .w3m-qrcode {
    position: relative;
    user-select: none;
    display: inline-block;
  }

  .w3m-qrcode img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
`
