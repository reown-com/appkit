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
    border-radius: var(--wui-border-radius-m);
  }

  wui-qr-code {
    animation: fadein ease 200ms;
  }
`
