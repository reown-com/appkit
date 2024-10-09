// Since we're using the CDN, we can access AppKit globals directly
const createAppKit = window.AppKit.createAppKit
const appKitNetworks = window.AppKit.networks
const WagmiAdapter = window.AppKit.WagmiAdapter
const SolanaAdapter = window.AppKit.SolanaAdapter

if (!AppKit || !AppKit.createAppKit) {
  throw new Error('AppKit or createAppKit not found on window object')
} else {
  const projectId = '3bdbc796b351092d40d5d08e987f4eca' // Replace with your actual project ID
  const networks = [appKitNetworks.mainnet, appKitNetworks.polygon, appKitNetworks.base]

  try {
    const wagmiAdapter = new AppKit.WagmiAdapter({
      projectId,
      networks
    })

    // 3. Create modal
    const modal = AppKit.createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata: {
        name: 'Html CDN Example',
        description: 'Html CDN Example using local server',
        url: 'https://reown.com/appkit',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      networks: [],
      themeMode: 'light'
    })

    // 4. Trigger modal programmatically
    document.addEventListener('DOMContentLoaded', () => {
      const openConnectModalBtn = document.getElementById('open-appkit')
      const openNetworkModalBtn = document.getElementById('open-appkit-networks')

      if (openConnectModalBtn && openNetworkModalBtn) {
        openConnectModalBtn.addEventListener('click', () => {
          modal.open()
        })
        openNetworkModalBtn.addEventListener('click', () => {
          modal.open({ view: 'Networks' })
        })
      }
    })
  } catch (error) {
    console.error('Error creating or using modal:', error)
  }
}
