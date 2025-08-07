import { css } from '@reown/appkit-ui'

export default css`
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: 400ms;
    animation-timing-function: 'ease-in-out';
    animation-name: fadein;
    animation-fill-mode: forwards;
  }
`
