import { css } from 'lit'

export default css`
  div {
    position: relative;
    border-radius: 12px;
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
  }

  .wui-size-sm {
    width: 40px;
    height: 40px;
  }

  .wui-size-sm > wui-icon {
    width: 18px;
    height: 18px;
  }

  .wui-size-md {
    border-radius: 16px;
    width: 56px;
    height: 56px;
  }

  .wui-size-md > wui-icon {
    width: 24px;
    height: 24px;
  }

  .wui-size-lg {
    border-radius: 28px;
    width: 80px;
    height: 80px;
  }

  .wui-size-lg > wui-icon {
    width: 42px;
    height: 42px;
  }
`
