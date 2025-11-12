import { css } from '@reown/appkit-ui'

export default css`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .action-button {
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius['4']};
  }

  .action-button:disabled {
    border-color: 1px solid ${({ tokens }) => tokens.core.glass010};
  }

  .transfer-inputs-container {
    position: relative;
  }

  .recipient-input-container {
    width: 100%;
  }

  .recipient-input-container wui-input-text {
    width: 100%;
  }

  .details-container {
    width: 100%;
  }

  .details-row {
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .fee-token-image {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px ${({ tokens }) => tokens.core.glass010};
  }
`
