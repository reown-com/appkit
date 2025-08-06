import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
    user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }

  :host([boxed]) {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  :host([rounded]) {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  :host([boxed]) img {
    width: 20px;
    height: 20px;
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  :host([boxed]) wui-icon {
    width: 16px;
    height: 16px;
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }
`
