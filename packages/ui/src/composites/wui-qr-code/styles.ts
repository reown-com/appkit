import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    background-color: ${({ colors }) => colors.white};
    border: 1px solid ${({ tokens }) => tokens.theme.borderPrimary};
  }

  :host {
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    box-shadow: inset 0 0 0 4px ${({ tokens }) => tokens.theme.backgroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[6]};
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }

  wui-icon > svg {
    width: inherit;
    height: inherit;
  }
`
