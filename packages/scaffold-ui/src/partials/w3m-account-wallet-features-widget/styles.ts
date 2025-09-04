import { css } from '@reown/appkit-ui'

export default css`
  wui-flex {
    width: 100%;
  }

  wui-promo {
    position: absolute;
    top: -32px;
  }

  wui-profile-button {
    margin-top: calc(-1 * ${({ spacing }) => spacing['4']});
  }

  wui-promo + wui-profile-button {
    margin-top: ${({ spacing }) => spacing['4']};
  }

  wui-tabs {
    width: 100%;
  }

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
