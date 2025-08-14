import { css } from '@reown/appkit-ui'

export default css`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({ spacing }) => spacing['2']};
    height: 40px;
    padding: ${({ spacing }) => spacing['2']} ${({ spacing }) => spacing['2']}
      ${({ spacing }) => spacing['2']} ${({ spacing }) => spacing['2']};
    min-width: 95px;
    border-radius: ${({ borderRadius }) => borderRadius['round']};
    border: 1px solid ${({ tokens }) => tokens.theme.foregroundPrimary};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`
