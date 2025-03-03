import { css } from 'lit'

export default css`
  .wui-profile-wallet-item {
    padding: 11px 18px 11px var(--wui-spacing-s);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
    transition:
      color var(--wui-ease-out-power-1) var(--wui-duration-md),
      background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: color, background-color;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--wui-spacing-m);
  }
`
