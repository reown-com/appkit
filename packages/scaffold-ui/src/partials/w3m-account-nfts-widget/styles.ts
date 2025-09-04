import { css } from '@reown/appkit-ui'

export default css`
  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({ borderRadius }) => borderRadius['3']};
  }

  .contentContainer > .textContent {
    width: 65%;
  }
`
