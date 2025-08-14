import { css } from '@reown/appkit-ui'

export default css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    padding: ${({ spacing }) => spacing['3']};
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${({ spacing }) => spacing['3']};
  }

  :host > wui-flex:hover {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .purchase-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: ${({ spacing }) => spacing['10']};
    height: ${({ spacing }) => spacing['10']};
  }

  .purchase-image-container wui-image {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: calc(${({ spacing }) => spacing['10']} / 2);
  }

  .purchase-image-container wui-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(${({ spacing }) => spacing['10']} / 2);
    box-shadow: inset 0 0 0 1px ${({ tokens }) => tokens.core.glass010};
  }

  .purchase-image-container wui-icon-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
  }
`
