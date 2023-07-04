import { css } from 'lit'

export default css`
  div {
    width: var(--container-width);
    height: var(--container-height);
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: inherit;
  }

  ::slotted(*) {
    width: 100%;
  }
`
