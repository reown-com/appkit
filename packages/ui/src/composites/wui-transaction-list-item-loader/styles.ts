import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host > wui-flex:first-child {
    gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`
