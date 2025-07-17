import { css } from 'lit'

export default css`
  wui-flex {
    width: 100%;
  }

  wui-tabs {
    width: 100%;
  }

  :host {
    min-height: 100%;
  }

  .group-container {
    max-height: 400px;
    border-bottom-left-radius: var(--apkt-borderRadius-4);
    border-bottom-right-radius: var(--apkt-borderRadius-4);
    overflow: scroll;
  }

  .group-container[last-group='true'] {
    padding-bottom: var(--apkt-spacing-3);
  }

  .session-container {
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    border-radius: var(--apkt-borderRadius-4);
    cursor: pointer;
  }

  .session-project-image {
    border-radius: var(--apkt-borderRadius-2);
    width: 40px;
    height: 40px;
  }
`
