import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    background-color: var(--local-bg-color);
    padding: var(--local-spacing);
  }

  :host > wui-icon {
    color: var(--local-icon-color);
  }
`
