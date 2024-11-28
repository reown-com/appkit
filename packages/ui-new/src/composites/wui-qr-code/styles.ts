import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    user-select: none;
    overflow: hidden;
    box-sizing: border-box;
    aspect-ratio: 1 / 1;
    width: var(--local-size);
    background-color: ${({ tokens }) => tokens.theme.backgroundInvert};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
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
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: var(--wui-border-radius-xs);
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: #3396ff !important;
    transform: translateY(-50%) translateX(-50%) scale(0.29);
  }

  wui-icon[name='farcaster'] {
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }
`
