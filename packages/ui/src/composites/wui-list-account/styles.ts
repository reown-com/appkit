import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    padding: 6.5px ${({ spacing }) => spacing['4']} 6.5px ${({ spacing }) => spacing['2']};
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-clickable='false'] {
    pointer-events: none;
    background-color: transparent;
  }

  wui-image {
    width: ${({ spacing }) => spacing['10']};
    height: ${({ spacing }) => spacing['10']};
    border-radius: ${({ borderRadius }) => borderRadius['20']};
  }

  wui-avatar {
    width: ${({ spacing }) => spacing['10']};
    height: ${({ spacing }) => spacing['10']};
    box-shadow: 0 0 0 0;
  }
  .address {
    color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }
  .address-description {
    text-transform: capitalize;
    color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  wui-icon-box {
    position: relative;
    right: 15px;
    top: 15px;
    border: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
  }
`
