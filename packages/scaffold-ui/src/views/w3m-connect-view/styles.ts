import { css } from 'lit'

export default css`
  .connect-scroll-view {
    max-height: clamp(360px, 540px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  .connect-scroll-view::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  w3m-legal-checkbox {
    padding: var(--wui-spacing-s);
  }

  .connect-scroll-view.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`
