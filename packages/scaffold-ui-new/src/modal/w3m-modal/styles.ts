import { css } from '@reown/appkit-ui-new'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'

export default css`
  :host {
    z-index: var(--w3m-z-index);
    display: flex;
    justify-content: center;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: rgba(0, 0, 0, 0.8);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  wui-flex {
    display: grid;
    grid-template-columns: ${UiHelperUtil.getBreakPointStyle('2XL', 'GRID_COLUMNS')};
    grid-template-rows: ${UiHelperUtil.getBreakPointStyle('2XL', 'GRID_ROWS')};
    max-width: ${UiHelperUtil.getBreakPointStyle('2XL', 'MAX_WIDTH')};
    gap: ${UiHelperUtil.getBreakPointStyle('2XL', 'MARGIN')};
    padding: ${UiHelperUtil.getBreakPointStyle('2XL', 'MARGIN')};
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    height: 100%;
  }

  .modal-grid {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    grid-column: ${UiHelperUtil.getBreakPointStyle('2XL', 'MODAL_GRID_COLUMN_PLACEMENT')};
    grid-row: ${UiHelperUtil.getBreakPointStyle('2XL', 'MODAL_GRID_ROW_PLACEMENT')};
    padding: ${UiHelperUtil.getBreakPointStyle('2XL', 'GUTTER')};
  }

  .modal-card {
    border-top-right-radius: ${({ borderRadius }) => borderRadius[8]};
    border-bottom-right-radius: ${({ borderRadius }) => borderRadius[8]};
    border-top-left-radius: ${({ borderRadius }) => borderRadius[8]};
    border-bottom-left-radius: ${({ borderRadius }) => borderRadius[8]};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    width: 100%;
  }

  @media screen and (max-width: ${UiHelperUtil.getBreakPointStyle('2XL', 'MAX_WIDTH')}) {
    wui-flex {
      grid-template-columns: ${UiHelperUtil.getBreakPointStyle('XL', 'GRID_COLUMNS')};
      grid-template-rows: ${UiHelperUtil.getBreakPointStyle('XL', 'GRID_ROWS')};
      padding: ${UiHelperUtil.getBreakPointStyle('XL', 'MARGIN')};
    }

    .modal-grid {
      grid-column: ${UiHelperUtil.getBreakPointStyle('XL', 'MODAL_GRID_COLUMN_PLACEMENT')};
      grid-row: ${UiHelperUtil.getBreakPointStyle('XL', 'MODAL_GRID_ROW_PLACEMENT')};
      padding: ${UiHelperUtil.getBreakPointStyle('XL', 'GUTTER')};
    }
  }

  @media screen and (max-width: ${UiHelperUtil.getBreakPointStyle('XL', 'MAX_WIDTH')}) {
    wui-flex {
      grid-template-columns: ${UiHelperUtil.getBreakPointStyle('LG', 'GRID_COLUMNS')};
      grid-template-rows: ${UiHelperUtil.getBreakPointStyle('LG', 'GRID_ROWS')};
      padding: ${UiHelperUtil.getBreakPointStyle('LG', 'MARGIN')};
    }

    .modal-grid {
      grid-column: ${UiHelperUtil.getBreakPointStyle('LG', 'MODAL_GRID_COLUMN_PLACEMENT')};
      grid-row: ${UiHelperUtil.getBreakPointStyle('LG', 'MODAL_GRID_ROW_PLACEMENT')};
      padding: ${UiHelperUtil.getBreakPointStyle('LG', 'GUTTER')};
    }
  }

  @media screen and (max-width: ${UiHelperUtil.getBreakPointStyle('LG', 'MAX_WIDTH')}) {
    wui-flex {
      grid-template-columns: ${UiHelperUtil.getBreakPointStyle('MD', 'GRID_COLUMNS')};
      grid-template-rows: ${UiHelperUtil.getBreakPointStyle('MD', 'GRID_ROWS')};
      padding: ${UiHelperUtil.getBreakPointStyle('MD', 'MARGIN')};
    }

    .modal-grid {
      grid-column: ${UiHelperUtil.getBreakPointStyle('MD', 'MODAL_GRID_COLUMN_PLACEMENT')};
      grid-row: ${UiHelperUtil.getBreakPointStyle('MD', 'MODAL_GRID_ROW_PLACEMENT')};
      padding: ${UiHelperUtil.getBreakPointStyle('MD', 'GUTTER')};
    }
  }

  @media screen and (max-width: ${UiHelperUtil.getBreakPointStyle('MD', 'MAX_WIDTH')}) {
    wui-flex {
      grid-template-columns: ${UiHelperUtil.getBreakPointStyle('SM', 'GRID_COLUMNS')};
      grid-template-rows: ${UiHelperUtil.getBreakPointStyle('SM', 'GRID_ROWS')};
      padding: ${UiHelperUtil.getBreakPointStyle('SM', 'MARGIN')};
    }

    .modal-grid {
      grid-column: ${UiHelperUtil.getBreakPointStyle('SM', 'MODAL_GRID_COLUMN_PLACEMENT')};
      grid-row: ${UiHelperUtil.getBreakPointStyle('SM', 'MODAL_GRID_ROW_PLACEMENT')};
      padding: ${UiHelperUtil.getBreakPointStyle('SM', 'GUTTER')};
    }
  }

  @media screen and (max-width: ${UiHelperUtil.getBreakPointStyle('SM', 'MAX_WIDTH')}) {
    wui-flex {
      grid-template-columns: ${UiHelperUtil.getBreakPointStyle('XS', 'GRID_COLUMNS')};
      grid-template-rows: ${UiHelperUtil.getBreakPointStyle('XS', 'GRID_ROWS')};
      padding: ${UiHelperUtil.getBreakPointStyle('XS', 'MARGIN')};
    }

    .modal-grid {
      grid-column: ${UiHelperUtil.getBreakPointStyle('XS', 'MODAL_GRID_COLUMN_PLACEMENT')};
      grid-row: ${UiHelperUtil.getBreakPointStyle('XS', 'MODAL_GRID_ROW_PLACEMENT')};
      padding: ${UiHelperUtil.getBreakPointStyle('XS', 'GUTTER')};
    }

    .modal-card {
      height: 100%;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
`
