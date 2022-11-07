import { html } from 'lit'
import { color } from '../../utils/Theme'
import scssStyles from './styles.scss'
import { scss } from '../../style/utils'

export default scss`${scssStyles}`

export function dynamicStyles() {
  const { background, foreground } = color()

  return html`
    <style>
      w3m-modal-content::before {
        box-shadow: 0 -1px 0 0 ${background[1]};
        background: linear-gradient(${background[1]}, transparent);
      }

      .w3m-explorer-search {
        background: ${background[2]};
      }

      .w3m-explorer-search:active,
      .w3m-explorer-search:focus-within {
        border: solid 1px ${foreground.accent};
        background: ${background[1]};
      }

      .w3m-explorer-search svg {
        height: 20px;
        width: 20px;
      }

      w3m-modal-content::after {
        box-shadow: 0 1px 0 0 ${background[1]};
        background: linear-gradient(transparent, ${background[1]});
        top: calc(100% - 18px);
      }
    </style>
  `
}
