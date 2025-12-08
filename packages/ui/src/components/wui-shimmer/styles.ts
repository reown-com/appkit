import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({ tokens }) => tokens.theme.foregroundPrimary} 0%,
      ${({ tokens }) => tokens.theme.foregroundSecondary} 50%,
      ${({ tokens }) => tokens.theme.foregroundPrimary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`
