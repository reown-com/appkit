import { css } from 'lit'

export default css`
  div:first-of-type {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .wui-overlay-default {
    background-color: var(--wui-overlay-020);
  }

  .wui-overlay-sm {
    background-color: color-mix(in srgb, var(--wui-bg-value) 12%, transparent);
  }

  .wui-overlay-md {
    background-color: color-mix(in srgb, var(--wui-bg-value) 16%, transparent);
  }

  .wui-size-sm {
    width: 20px;
    height: 20px;
    border-radius: var(--wui-border-radius-3xl);
  }

  .wui-size-md {
    width: 24px;
    height: 24px;
    border-radius: var(--wui-border-radius-3xl);
  }

  .wui-size-lg {
    width: 40px;
    height: 40px;
    border-radius: var(--wui-border-radius-xxs);
  }
`
