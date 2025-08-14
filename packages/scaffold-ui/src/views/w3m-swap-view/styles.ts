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

  .swap-inputs-container {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({ borderRadius }) => borderRadius['10']} !important;
    border: 4px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  .replace-tokens-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    gap: ${({ spacing }) => spacing['2']};
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    padding: ${({ spacing }) => spacing['2']};
  }

  .details-container > wui-flex {
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({ spacing }) => spacing['3']};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    transition: background ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-2']};
    will-change: background;
  }

  .details-container > wui-flex > button:hover {
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .details-content-container {
    padding: ${({ spacing }) => spacing['2']};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({ spacing }) => spacing['3']} ${({ spacing }) => spacing['5']};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }
`
