import { css } from 'lit'

export default css`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
  }

  .balance-amount {
    flex: 1;
  }

  .wallet-list {
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
      black 40px,
      black calc(100% - 40px),
      rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
    );
  }

  .active-wallets {
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
  }

  .active-wallets-box {
    height: 330px;
  }

  .empty-wallet-list-box {
    height: 400px;
  }

  .empty-box {
    width: 100%;
    padding: var(--wui-spacing-l);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
  }

  wui-separator {
    margin: var(--wui-spacing-xs) 0 var(--wui-spacing-xs) 0;
  }

  .active-connection {
    padding: var(--wui-spacing-xs);
  }

  .recent-connection {
    padding: var(--wui-spacing-xs) 0 var(--wui-spacing-xs) 0;
  }

  @media (max-width: 430px) {
    .active-wallets-box,
    .empty-wallet-list-box {
      height: auto;
      max-height: clamp(360px, 470px, 80vh);
    }
  }
`
