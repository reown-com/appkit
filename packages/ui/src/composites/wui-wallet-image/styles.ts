import { css } from 'lit'

export default css`
  div {
    position: relative;
    border-radius: inherit;
    overflow: hidden;
    background: var(--wui-overlay-002);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-overlay-010);
    pointer-events: none;
  }

  .wui-size-inherit {
    width: inherit;
    height: inherit;
  }

  .wui-size-inherit > wui-icon {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  .wui-size-sm {
    border-radius: var(--wui-border-radius-xxs);
    width: 40px;
    height: 40px;
  }

  .wui-size-sm > wui-icon {
    width: 18px;
    height: 18px;
  }

  .wui-size-md {
    border-radius: var(--wui-border-radius-xs);
    width: 56px;
    height: 56px;
  }

  .wui-size-md > wui-icon {
    width: 24px;
    height: 24px;
  }

  .wui-size-lg {
    border-radius: var(--wui-border-radius-m);
    width: 80px;
    height: 80px;
  }

  .wui-size-lg > wui-icon {
    width: 42px;
    height: 42px;
  }
`
