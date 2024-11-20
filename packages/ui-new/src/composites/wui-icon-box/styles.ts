import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--local-bg-color);
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: ${({ spacing }) => spacing[2]} !important;
  }

  :host > wui-icon {
    color: var(--local-icon-color);
  }
`
