import { useState } from 'react'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { provider } from './config'

export default function App() {
  document.documentElement.className = 'light'

  const [session, setSession] = useState<any>(provider.session)
  const [account, setAccount] = useState<string | undefined>(provider.accounts[0])
  const [network, setNetwork] = useState<string | undefined>(provider.chainId.toString())
  const [balance, setBalance] = useState<string | undefined>(undefined)

  provider.on('chainChanged', chainId => {
    setNetwork(chainId)
  })

  provider.on('accountsChanged', accounts => {
    setAccount(accounts[0])
  })

  provider.on('connect', session => {
    setSession(session)
  })

  return (
    <div className="page-container">
      <Header />
      <ActionButtonList
        provider={provider}
        session={session}
        account={account}
        onSessionChange={setSession}
        onBalanceChange={setBalance}
        onAccountChange={setAccount}
        onNetworkChange={setNetwork}
      />
      <InfoList account={account} network={network} session={session} balance={balance} />
      <Footer />
    </div>
  )
}
