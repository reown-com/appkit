'use client'

import { useEffect, useState } from 'react'

import type UniversalProvider from '@walletconnect/universal-provider'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { initializeModal, initializeProvider } from './config'

export default function App() {
  const [provider, setProvider] = useState<InstanceType<typeof UniversalProvider>>()
  const [session, setSession] = useState<any>()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()
  const [balance, setBalance] = useState<string>()

  useEffect(() => {
    document.documentElement.className = 'light'
    const init = async () => {
      const universalProvider = await initializeProvider()
      if (!universalProvider) return

      setProvider(universalProvider)
      initializeModal(universalProvider)

      if (universalProvider.session) {
        setSession(universalProvider.session)
        setAccount(universalProvider.session?.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
        setNetwork(universalProvider.session?.namespaces['eip155']?.chains?.[0])
      }
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

    const handleConnect = async (session: any) => {
      const modal = initializeModal(provider)
      await modal?.close()
      setSession(session)
      setAccount(session?.session?.namespaces?.eip155?.accounts?.[0].split(':')[2])
      setNetwork(session?.session?.namespaces?.eip155?.chains?.[0])
    }

    const handleDisplayUri = (uri: string) => {
      const modal = initializeModal(provider)
      modal?.open({ uri })
    }

    provider.on('chainChanged', handleChainChanged)
    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('connect', handleConnect)
    provider.on('display_uri', handleDisplayUri)

    return () => {
      provider.removeListener('chainChanged', handleChainChanged)
      provider.removeListener('accountsChanged', handleAccountsChanged)
      provider.removeListener('connect', handleConnect)
      provider.removeListener('display_uri', handleDisplayUri)
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
