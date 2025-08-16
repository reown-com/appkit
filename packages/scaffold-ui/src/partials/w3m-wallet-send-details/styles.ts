import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: flex;
    width: auto;
    flex-direction: column;
    gap: ${({ spacing }) => spacing['1']};
    border-radius: ${({ borderRadius }) => borderRadius['5']};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    padding: ${({ spacing }) => spacing['3']} ${({ spacing }) => spacing['2']}
      ${({ spacing }) => spacing['2']} ${({ spacing }) => spacing['2']};
  }

  wui-list-content {
    width: -webkit-fill-available !important;
  }

  wui-text {
    padding: 0 ${({ spacing }) => spacing['2']};
  }

  wui-flex {
    margin-top: ${({ spacing }) => spacing['2']};
  }

  .network {
    cursor: pointer;
    transition: background-color ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-1']};
    will-change: background-color;
  }

  .network:focus-visible {
    border: 1px solid ${({ tokens }) => tokens.core.textAccentPrimary};
    background-color: ${({ tokens }) => tokens.core.glass010};
    -webkit-box-shadow: 0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent010};
    -moz-box-shadow: 0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  .network:hover {
    background-color: ${({ tokens }) => tokens.core.glass010};
  }

  .network:active {
    background-color: ${({ tokens }) => tokens.core.glass010};
  }
`
