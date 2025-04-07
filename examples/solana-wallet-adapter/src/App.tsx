import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import './App.css'
import { SolanaContext } from './SolanaContext'
import { RequestAirdrop } from './components/RequestAirdrop'
import { SendLegacyTransaction } from './components/SendLegacyTransaction'
import { SendTransaction } from './components/SendTransaction'
import { SendV0Transaction } from './components/SendV0Transaction'
import { SignTransaction } from './components/SignTransaction'
import { SignMessage } from './components/signMessage'

function App2() {
  const walletState = useWallet()

  useEffect(() => {
    console.log('walletState', walletState)
  }, [walletState])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      <Toaster />
      {walletState.connected ? (
        <>
          <WalletDisconnectButton />
          <SignMessage />
          <SignTransaction />
          <SendLegacyTransaction />
          <SendV0Transaction />
          <SendTransaction />
          <RequestAirdrop />
        </>
      ) : (
        <>
          <WalletMultiButton />
          <div>Please connect your wallet to continue</div>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <SolanaContext>
      <App2 />
    </SolanaContext>
  )
}

export default App
