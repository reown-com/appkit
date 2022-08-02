import { css, unsafeCSS as t } from 'lit'
import color from '../../theme/colors'

const bgLight = t(color().light.foreground.accent)
const bgDark = t(color().dark.foreground.accent)
const fontColor = t(color().light.foreground.inverse)

export default css`
  :host button {
    border: none;
    transition: 0.2s filter ease-in-out;
    color: ${fontColor};
  }

  :host button:hover {
    filter: brightness(90%);
  }

  /* Dark Mode */
  @media (prefers-color-scheme: dark) {
    :host button {
      background-color: ${bgDark};
    }

    :host button:hover {
      filter: brightness(110%);
    }
  }

  /* Light Mode */
  @media (prefers-color-scheme: light) {
    :host button {
      background-color: ${bgLight};
    }

    :host button:hover {
      filter: brightness(90%);
    }
  }
`
