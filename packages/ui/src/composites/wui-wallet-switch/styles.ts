import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    display: flex;
    align-items: center;
    padding: var(--apkt-spacing-2);
    border-radius: var(--wui-border-radius-xxs);
    column-gap: var(--apkt-spacing-2);
    background-color: ${({ tokens }) => tokens.theme.foregroundTertiary};
  }

  wui-image,
  .icon-box {
    width: var(--apkt-spacing-6);
    height: var(--apkt-spacing-6);
    border-radius: ${({ borderRadius }) => borderRadius[1]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundTertiary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: var(--apkt-spacing-2);
    height: var(--apkt-spacing-2);
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
    border: 2px solid var(--wui-color-modal-bg);
    border-radius: 50%;
  }
`
