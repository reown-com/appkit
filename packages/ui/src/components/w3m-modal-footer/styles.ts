import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-modal-footer {
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
`

export function dynamicStyles() {
  const { background } = color()

  return html`<style>
    .w3m-modal-footer {
      border-top: 1px solid ${background[3]};
      background-color: ${background[2]};
    }
  </style>`
}
