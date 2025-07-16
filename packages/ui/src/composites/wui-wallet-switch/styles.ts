import { css } from 'lit'

export default css`
  button {
    display: flex;
    align-items: center;
    padding: var(--apkt-spacing-2);
    border-radius: var(--wui-border-radius-xxs);
    column-gap: var(--apkt-spacing-2);
  }

  wui-image,
  .icon-box {
    width: var(--apkt-spacing-6);
    height: var(--apkt-spacing-6);
    border-radius: var(--wui-border-radius-3xs);
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: var(--wui-color-gray-glass-005);
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: var(--apkt-spacing-2);
    height: var(--apkt-spacing-2);
    background-color: var(--wui-color-success-100);
    border: 2px solid var(--wui-color-modal-bg);
    border-radius: 50%;
  }
`
