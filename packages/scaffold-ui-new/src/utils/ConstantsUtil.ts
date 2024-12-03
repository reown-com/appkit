export const ConstantsUtil = {
  ACCOUNT_TABS: [{ label: 'Tokens' }, { label: 'NFTs' }, { label: 'Activity' }],
  SECURE_SITE_ORIGIN:
    process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN'] || 'https://secure.walletconnect.org',
  VIEW_DIRECTION: {
    Next: 'next',
    Prev: 'prev'
  },
  ANIMATION_DURATIONS: {
    HeaderText: 120,
    ModalHeight: 150,
    ViewTransition: 150
  },
  BREAKPOINTS: {
    '2XL': {
      MAX_WIDTH: 1536,
      GRID_COLUMNS: 8,
      GRID_ROWS: 10,
      MARGIN: 16,
      GUTTER: [16, 0, 16, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [4, 6],
      MODAL_GRID_ROW_PLACEMENT: [2, 10]
    },
    XL: {
      MAX_WIDTH: 1280,
      GRID_COLUMNS: 8,
      GRID_ROWS: 12,
      MARGIN: 8,
      GUTTER: [8, 0, 8, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [4, 6],
      MODAL_GRID_ROW_PLACEMENT: [2, 12]
    },
    LG: {
      MAX_WIDTH: 1024,
      GRID_COLUMNS: 9,
      GRID_ROWS: 9,
      MARGIN: 8,
      GUTTER: [8, 0, 8, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [4, 7],
      MODAL_GRID_ROW_PLACEMENT: [2, 9]
    },
    MD: {
      MAX_WIDTH: 768,
      GRID_COLUMNS: 8,
      GRID_ROWS: 8,
      MARGIN: 8,
      GUTTER: [8, 0, 8, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [3, 7],
      MODAL_GRID_ROW_PLACEMENT: [2, 8]
    },
    SM: {
      MAX_WIDTH: 570,
      GRID_COLUMNS: 9,
      GRID_ROWS: 8,
      MARGIN: 8,
      GUTTER: [8, 0, 8, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [3, 8],
      MODAL_GRID_ROW_PLACEMENT: [2, 8]
    },
    XS: {
      MAX_WIDTH: 375,
      GRID_COLUMNS: 2,
      GRID_ROWS: 10,
      MARGIN: 0,
      GUTTER: [8, 0, 0, 0],

      /* Modal grid placement */
      MODAL_GRID_COLUMN_PLACEMENT: [1, -1],
      MODAL_GRID_ROW_PLACEMENT: [1, -1]
    }
  }
}
