import { useState } from 'react'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { modal, provider } from './config'

export default function App() {
  document.documentElement.className = 'light'

  const [session, setSession] = useState<any>(provider.session)
  const [account, setAccount] = useState<string | undefined>(
    provider.session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2]
  )
  const [network, setNetwork] = useState<string | undefined>(
    provider.session?.namespaces['eip155']?.chains?.[0]
  )
  const [balance, setBalance] = useState<string | undefined>(undefined)

  provider.on('chainChanged', (chainId: string) => {
    setNetwork(chainId)
  })

  provider.on('accountsChanged', (accounts: string[]) => {
    setAccount(accounts[0])
  })

  provider.on('connect', async (session: any) => {
    await modal.close()
    setSession(session)
    setAccount(session?.session?.namespaces?.eip155?.accounts?.[0].split(':')[2])
    setNetwork(session?.session?.namespaces?.eip155?.chains?.[0])
  })

  provider.on('display_uri', (uri: string) => {
    modal.open({ uri, view: 'ConnectingWalletConnectBasic' })
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
