import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-modal-footer {
    padding: 15px 18px;
    display: flex;
    flex-direction: column;
    align-items: inherit;
    justify-content: inherit;
  }
`

export function dynamicStyles() {
  const { background } = color()

  return html`<style>
    .w3m-modal-footer {
      border-top: 1px solid ${background[2]};
    }
  </style>`
}
