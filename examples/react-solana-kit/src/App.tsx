import Footer from './components/Footer'
import SolanaKitDemo from './components/SolanaKitDemo'

export default function App() {
  return (
    <div className="page-container">
      <div className="logo-container">
        <img src="/reown-logo.png" alt="Reown" width="150" />
        <img src="/appkit-logo.png" alt="AppKit" width="150" />
      </div>

      <h1 className="page-title">AppKit + @solana/kit Integration POC</h1>

      <div className="appkit-buttons-container">
        <appkit-button />
        <appkit-network-button />
      </div>

      <SolanaKitDemo />
      <Footer />
    </div>
  )
}
