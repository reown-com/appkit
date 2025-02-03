import { useEffect, useState } from 'react'

import type { EthereumProvider } from '@walletconnect/ethereum-provider'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { initializeProvider } from './config'

export default function App() {
  document.documentElement.className = 'light'

  const [provider, setProvider] = useState<InstanceType<typeof EthereumProvider>>()
  const [session, setSession] = useState<any>()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()
  const [balance, setBalance] = useState<string>()

  useEffect(() => {
    const init = async () => {
      const wcProvider = await initializeProvider()
      setProvider(wcProvider)
      if (wcProvider?.session) setSession(wcProvider.session)
      if (wcProvider?.accounts?.[0]) setAccount(wcProvider.accounts[0])
      if (wcProvider?.chainId) setNetwork(wcProvider.chainId.toString())
    }
    init()
  }, [])

  useEffect(() => {
    if (!provider) return

    provider.on('chainChanged', chainId => {
      setNetwork(chainId)
    })

    provider.on('accountsChanged', accounts => {
      setAccount(accounts[0])
    })

    provider.on('connect', session => {
      setSession(session)
    })

    return () => {
      provider.removeListener('chainChanged', chainId => {
        setNetwork(chainId)
      })
      provider.removeListener('accountsChanged', accounts => {
        setAccount(accounts[0])
      })
      provider.removeListener('connect', session => {
        setSession(session)
      })
    }
  }, [provider])

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
