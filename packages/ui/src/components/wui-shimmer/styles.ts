import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({ tokens }) => tokens.theme.foregroundSecondary} 0%,
      ${({ tokens }) => tokens.theme.foregroundTertiary} 50%,
      ${({ tokens }) => tokens.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`
