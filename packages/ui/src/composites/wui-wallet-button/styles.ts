import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  :host > button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${({ tokens }) => tokens.theme.backgroundInvert};
    gap: ${({ spacing }) => spacing[1]};
    border: none;
    transition: border-radius ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-2']};
    will-change: border-radius;
    color: ${({ tokens }) => tokens.theme.textInvert};
  }

  :host > button > wui-text {
    text-transform: capitalize;
  }

  :host > button > wui-image {
    border-radius: ${({ borderRadius }) => borderRadius[1]};
  }

  :host([data-error='true']) > button > wui-icon {
    color: ${({ tokens }) => tokens.core.textError};
  }

  :host([data-error='true']) > button {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  /* -- Size states ----------------------------------------------------------- */
  :host > button[data-size='lg'] {
    padding-top: ${({ spacing }) => spacing[4]};
    padding-bottom: ${({ spacing }) => spacing[4]};
    padding-left: ${({ spacing }) => spacing[5]};
    padding-right: ${({ spacing }) => spacing[5]};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    height: 52px;

    wui-image {
      height: 20px;
      width: 20px;
    }
  }

  :host > button[data-size='md'] {
    padding-top: ${({ spacing }) => spacing[3]};
    padding-bottom: ${({ spacing }) => spacing[3]};
    padding-left: ${({ spacing }) => spacing[4]};
    padding-right: ${({ spacing }) => spacing[4]};
    border-radius: ${({ borderRadius }) => borderRadius[3]};
    height: 40px;

    wui-image {
      height: 16px;
      width: 16px;
    }
  }

  :host > button[data-size='sm'] {
    padding-top: ${({ spacing }) => spacing[2]};
    padding-bottom: ${({ spacing }) => spacing[2]};
    padding-left: ${({ spacing }) => spacing[3]};
    padding-right: ${({ spacing }) => spacing[3]};
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    height: 30px;

    wui-image {
      height: 12px;
      width: 12px;
    }
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      border-radius: ${({ borderRadius }) => borderRadius[16]};
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  :host > button:disabled {
    cursor: default;
  }

  :host > button:disabled wui-image,
  :host > button:disabled wui-icon,
  :host > button:disabled wui-text {
    opacity: 0.5;
  }
`
