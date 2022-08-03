import { css, unsafeCSS as t } from 'lit'
import color from '../../theme/colors'

const bgLight = t(color().light.foreground.accent)
const bgDark = t(color().dark.foreground.accent)
const bgLightDisabled = t(color().light.background[3])
const bgDarkDisabled = t(color().dark.background[3])
const fontColor = t(color().light.foreground.inverse)
const fontColorLightDisabled = t(color().light.foreground[3])
const fontColorDarkDisabled = t(color().dark.foreground[3])

export default css`
  button {
    border: none;
    transition: 0.2s filter ease-in-out;
    padding: 0 15px 2px;
    height: 40px;
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${fontColor};
  }

  button:disabled {
    cursor: not-allowed;
  }

  svg {
    width: 28px;
    height: 20px;
    margin-right: 3px;
    margin-left: -5px;
  }

  svg path {
    fill: ${fontColor};
  }

  span {
    padding-top: 1px;
  }

  @media (prefers-color-scheme: dark) {
    button {
      background-color: ${bgDark};
    }

    button:hover {
      filter: brightness(110%);
    }

    button:active {
      filter: brightness(120%);
    }

    button:disabled {
      background-color: ${bgDarkDisabled};
      color: ${fontColorDarkDisabled};
    }

    button:disabled svg path {
      fill: ${fontColorDarkDisabled};
    }
  }

  @media (prefers-color-scheme: light) {
    button {
      background-color: ${bgLight};
    }

    button:hover {
      filter: brightness(90%);
    }

    button:active {
      filter: brightness(80%);
    }

    button:disabled {
      background-color: ${bgLightDisabled};
      color: ${fontColorLightDisabled};
    }

    button:disabled svg path {
      fill: ${fontColorLightDisabled};
    }
  }
`
