import { css } from 'lit'

export default css`
  .email-sufixes {
    display: flex;
    flex-direction: row;
    gap: 4px;
    overflow-x: auto;
    max-width: 100%;
    margin-top: 12px;
  }

  .recent-emails {
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    border-top: 1px solid var(--wui-color-gray-glass-005);
    border-bottom: 1px solid var(--wui-color-gray-glass-005);
  }

  .recent-emails-heading {
    font-family: Inter;
    font-weight: 600;
    font-size: 10px;
    line-height: 130%;
    letter-spacing: 2%;
    vertical-align: middle;
    text-transform: uppercase;
    margin-bottom: 12px;
    color: var(--wui-color-fg-200);
  }

  .recent-emails-list-item {
    --wui-color-gray-glass-002: transparent;
  }
`
