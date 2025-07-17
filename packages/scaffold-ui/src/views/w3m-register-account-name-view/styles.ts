import { css } from 'lit'

export default css`
  wui-flex {
    width: 100%;
  }

  .suggestion {
    background: var(--apkt-tokens-theme-foregroundPrimary);
    border-radius: var(--apkt-borderRadius-4);
  }

  .suggestion:hover {
    background-color: var(--apkt-tokens-core-glass010);
    cursor: pointer;
  }

  .suggested-name {
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  form {
    width: 100%;
  }

  wui-icon-link {
    position: absolute;
    right: 20px;
    transform: translateY(11px);
  }
`
