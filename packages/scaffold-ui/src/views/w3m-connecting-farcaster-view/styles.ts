import { css } from '@reown/appkit-ui'

export default css`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: var(--apkt-duration-lg);
    animation-timing-function: var(--apkt-ease-out-power-2);
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: var(--apkt-borderRadius-7);
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--apkt-spacing-1) * -1);
    bottom: calc(var(--apkt-spacing-1) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity var(--apkt-duration-lg) var(--apkt-ease-out-power-2),
      transform var(--apkt-duration-lg) var(--apkt-ease-out-power-2);
    will-change: opacity, transform;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`
