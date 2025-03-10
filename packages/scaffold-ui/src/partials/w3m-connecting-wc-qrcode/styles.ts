import { css } from 'lit'

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
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px) !important;
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: 200ms;
    animation-timing-function: ease;
    animation-name: fadein;
    animation-fill-mode: forwards;
  }

  .w3m-connecting-wc-qrcode {
    border-bottom-left-radius: var(--wui-border-radius-l);
    border-bottom-right-radius: var(--wui-border-radius-l);
    border-bottom: 1px solid var(--wui-color-bg-125);
    box-shadow: 0 2px 0 0 var(--wui-color-gray-glass-005);
  }
  .reown-logo {
    height: 24px;
  }
`
