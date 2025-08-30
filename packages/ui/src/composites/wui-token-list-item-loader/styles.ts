import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    width: 100%;
    display: flex;
    column-gap: ${({ spacing }) => spacing['3']};
    padding: ${({ spacing }) => spacing['2']};
    padding-right: ${({ spacing }) => spacing['4']};
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`
