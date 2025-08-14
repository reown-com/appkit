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

  .preview-container,
  .details-container {
    width: 100%;
  }

  .token-image {
    width: 24px;
    height: 24px;
    box-shadow: 0 0 0 2px ${({ tokens }) => tokens.core.glass010};
    border-radius: 12px;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .token-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ spacing }) => spacing['2']};
    padding: ${({ spacing }) => spacing['2']};
    height: 40px;
    border: none;
    border-radius: 80px;
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: inset 0 0 0 1px ${({ tokens }) => tokens.theme.foregroundPrimary};
    cursor: pointer;
    transition: background ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-2']};
    will-change: background;
  }

  .token-item:hover {
    background: ${({ tokens }) => tokens.core.glass010};
  }

  .preview-token-details-container {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({ spacing }) => spacing['3']} ${({ spacing }) => spacing['5']};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .action-buttons-container {
    width: 100%;
    gap: ${({ spacing }) => spacing['2']};
  }

  .action-buttons-container > button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    height: 48px;
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    border: none;
    box-shadow: inset 0 0 0 1px ${({ tokens }) => tokens.core.glass010};
  }

  .action-buttons-container > button:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }

  .action-button > wui-loading-spinner {
    display: inline-block;
  }

  .cancel-button:hover,
  .action-button:hover {
    cursor: pointer;
  }

  .action-buttons-container > wui-button.cancel-button {
    flex: 2;
  }

  .action-buttons-container > wui-button.action-button {
    flex: 4;
  }

  .action-buttons-container > button.action-button > wui-text {
    color: white;
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
