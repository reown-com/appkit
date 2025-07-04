import { css } from 'lit'

export default css`
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: margin var(--wui-ease-out-power-1) var(--wui-duration-lg);
    gap: 4px;
    margin-top: -100px;
    height: 332px;

    &[data-state='loading'] {
      height: 184px;
    }
  }

  .hero-main-icon {
    width: 176px;
    transition: width var(--wui-ease-out-power-1) var(--wui-duration-lg);

    &[data-state='loading'] {
      width: 56px;
    }
  }

  .hero-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex-wrap: nowrap;
    min-width: fit-content;

    &:nth-child(1) {
      transform: translateX(-30px);
    }

    &:nth-child(2) {
      transform: translateX(30px);
    }

    &:nth-child(4) {
      transform: translateX(10px);
    }
  }

  .hero-row-icon {
    opacity: 0.1;

    &[data-state='loading'] {
      opacity: 0;
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
