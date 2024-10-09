console.log('Main script started')

// Since we're using the CDN, we can access AppKit globals directly
const AppKit = window.AppKit

console.log('Window AppKit:', window.AppKit)

if (!AppKit || !AppKit.createAppKit) {
  console.error('AppKit or createAppKit not found on window object')
  console.log('Window object:', window)
} else {
  console.log('AppKit found:', AppKit)

  // @ts-expect-error 1. Get projectId
  const projectId = '3bdbc796b351092d40d5d08e987f4eca' // Replace with your actual project ID

  try {
    console.log('Attempting to create modal...')
    // 3. Create modal
    const modal = AppKit.createAppKit({
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

    console.log('Modal created:', modal)

    // 4. Trigger modal programmatically
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM content loaded')
      const openConnectModalBtn = document.getElementById('open-connect-modal')
      const openNetworkModalBtn = document.getElementById('open-network-modal')

      if (openConnectModalBtn && openNetworkModalBtn) {
        openConnectModalBtn.addEventListener('click', () => {
          console.log('Connect button clicked')
          modal.open()
        })
        openNetworkModalBtn.addEventListener('click', () => {
          console.log('Network button clicked')
          modal.open({ view: 'Networks' })
        })
        console.log('Event listeners added')
      } else {
        console.error('Buttons not found')
      }
    })
  } catch (error) {
    console.error('Error creating or using modal:', error)
    console.log('Error details:', error.message, error.stack)
  }
}

console.log('Main script finished')
