import { css } from 'lit'

export default css`
  .connect-scroll-view {
    max-height: clamp(360px, 540px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  .connect-scroll-view::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  w3m-legal-checkbox {
    margin: 0 auto;
    max-width: fit-content;
    padding: var(--wui-spacing-3xs) var(--wui-spacing-s) 0 var(--wui-spacing-s);
  }

  .disabled-connect-view {
    /* opacity: 0.3;
    pointer-events: none;
    user-select: none; */
  }
`
