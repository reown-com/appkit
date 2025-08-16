import { css } from '@reown/appkit-ui'

export default css`
  button {
    padding: ${({ spacing }) => spacing['3']};
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    border: none;
    outline: none;
    background-color: ${({ tokens }) => tokens.core.glass010};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${({ spacing }) => spacing['3']};
    transition: background-color ${({ easings }) => easings['ease-out-power-1']}
      ${({ durations }) => durations['md']};
    will-change: background-color;
    cursor: pointer;
  }

  button:hover {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .provider-image {
    width: ${({ spacing }) => spacing['10']};
    min-width: ${({ spacing }) => spacing['10']};
    height: ${({ spacing }) => spacing['10']};
    border-radius: calc(
      ${({ borderRadius }) => borderRadius['4']} - calc(${({ spacing }) => spacing['3']} / 2)
    );
    position: relative;
    overflow: hidden;
  }

  .network-icon {
    width: ${({ spacing }) => spacing['3']};
    height: ${({ spacing }) => spacing['3']};
    border-radius: calc(${({ spacing }) => spacing['3']} / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px ${({ tokens }) => tokens.theme.foregroundPrimary},
      0 0 0 3px ${({ tokens }) => tokens.theme.backgroundPrimary};
    transition: box-shadow ${({ easings }) => easings['ease-out-power-1']}
      ${({ durations }) => durations['md']};
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px ${({ tokens }) => tokens.core.glass010},
      0 0 0 3px ${({ tokens }) => tokens.theme.backgroundPrimary};
  }
`
