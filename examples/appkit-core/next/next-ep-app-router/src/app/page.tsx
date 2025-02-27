'use client'

import { useEffect, useState } from 'react'

import { EthereumProvider } from '@walletconnect/ethereum-provider'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { initializeProvider } from './config'

export default function App() {
  const [provider, setProvider] = useState<InstanceType<typeof EthereumProvider>>()
  const [session, setSession] = useState<any>()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()
  const [balance, setBalance] = useState<string>()

  useEffect(() => {
    document.documentElement.className = 'light'
    const init = async () => {
      const ethProvider = await initializeProvider()
      if (!ethProvider) return

      setProvider(ethProvider)
      if (ethProvider.session) setSession(ethProvider.session)
      if (ethProvider.accounts?.[0]) setAccount(ethProvider.accounts[0])
      if (ethProvider.chainId) setNetwork(ethProvider.chainId.toString())
    }
    init()
  }, [])

  useEffect(() => {
    if (!provider) return

    const handleChainChanged = (chainId: string) => {
      setNetwork(chainId)
    }

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0])
    }

    const handleConnect = (session: any) => {
      setSession(session)
    }

    provider.on('chainChanged', handleChainChanged)
    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('connect', handleConnect)

    return () => {
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('connect', handleConnect)
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
