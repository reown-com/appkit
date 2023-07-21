import { css } from 'lit'

export default css`
  :host {
    display: flex;
    aspect-ratio: 1 / 1;
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }
`
