import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    height: auto;
    position: relative;
    flex-direction: column;
    gap: ${({ spacing }) => spacing[4]};
    padding: ${({ spacing }) => spacing[4]} ${({ spacing }) => spacing[3]};
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-active='false']:hover {
    outline: 1px solid ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button[data-active='true'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  .overflowedContent {
    width: 100%;
    overflow: hidden;
  }

  .overflowedContent[data-active='false']:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to top,
      ${({ tokens }) => tokens.theme.foregroundPrimary},
      transparent
    );
    border-bottom-left-radius: ${({ borderRadius }) => borderRadius[4]};
    border-bottom-right-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  .heightContent {
    max-height: 100px;
  }

  pre {
    text-align: left;
    white-space: pre-wrap;
    height: auto;
    overflow-x: auto;
    overflow-wrap: anywhere;
  }
`
