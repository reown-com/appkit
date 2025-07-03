import { css } from 'lit'

export default css`
  .hero {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 56px;
    padding-top: 112px;
    transition: padding var(--wui-ease-out-power-1) var(--wui-duration-lg);

    &[data-state='loading'] {
      padding-bottom: 0;
      padding-top: 0;
    }
  }

  .hero-main-icon {
    width: 176px;
    transition: width var(--wui-ease-out-power-1) var(--wui-duration-lg);

    &[data-state='loading'] {
      width: 56px;
    }
  }

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
    margin-bottom: 12px;
  }

  .recent-emails-list-item {
    --wui-color-gray-glass-002: transparent;
  }
`
