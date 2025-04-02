import { css } from 'lit'

export default css`
  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-xs)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }

  .token-info {
    background-color: var(--wui-color-bg-125);
    border-radius: var(--wui-border-radius-s);
    padding: var(--wui-spacing-xs) var(--wui-spacing-s);
  }
`
