import { css } from 'lit'

// eslint-disable-next-line no-warning-comments
// TODO: add spacing variables for 4px spacing

export default css`
  wui-image,
  .icon-box {
    width: var(--wui-spacing-2xl);
    height: var(--wui-spacing-2xl);
    border-radius: var(--wui-border-radius-3xs);
  }

  .icon-box {
    background-color: var(--wui-color-gray-glass-002);
  }

  .right-icon {
    cursor: pointer;
  }
`
