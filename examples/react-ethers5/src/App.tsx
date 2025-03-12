import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import InfoList from './components/InfoList'
import { useAppKitTheme } from './config'

export default function App() {
  const { themeMode } = useAppKitTheme()
  document.documentElement.className = themeMode

  return (
    <div className="page-container">
      <div className="logo-container">
        <img
          src={themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'}
          alt="Reown"
          width="150"
        />
        <img src="/appkit-logo.png" alt="Reown" width="150" />
      </div>
      <h1 className="page-title">React Ethers v5 Example</h1>
      <div className="appkit-buttons-container">
        <appkit-button />
        <appkit-network-button />
      </div>
      <ActionButtonList />
      <InfoList />
      <Footer />
    </div>
  )
}
