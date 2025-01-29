const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const ConstantsUtil = {
  WC_DEFAULT_PARAMS: {
    projectId: PROJECT_ID,
    metadata: {
      name: 'Cool DApp',
      description: 'An super cool dapp',
      url: 'https://reown.com',
      icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
    },
    qrModalOptions: {
      themeVariables: {
        '--wcm-font-family': '"Inter custom", sans-serif',
        '--wcm-z-index': '1000'
      }
    },
    showQrModal: true
  },
  PROJECT_ID
}
