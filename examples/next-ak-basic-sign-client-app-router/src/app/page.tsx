'use client'

import { useEffect, useState } from 'react'

import SignClient from '@walletconnect/sign-client'
import type { SessionTypes } from '@walletconnect/types'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { initializeModal, initializeSignClient } from './config'

export default function App() {
  const [signClient, setSignClient] = useState<InstanceType<typeof SignClient>>()
  const [session, setSession] = useState<SessionTypes.Struct>()
  const [account, setAccount] = useState<string>()
  const [network, setNetwork] = useState<string>()

  useEffect(() => {
    document.documentElement.className = 'light'
    const init = async () => {
      const client = await initializeSignClient()
      if (!client) return

      setSignClient(client)
      initializeModal()

      const lastKeyIndex = client.session.getAll().length - 1
      const lastSession = client.session.getAll()[lastKeyIndex]

      if (lastSession) {
        setSession(lastSession)
        setAccount(lastSession.namespaces['eip155']?.accounts?.[0]?.split(':')[2])
        setNetwork(lastSession.namespaces['eip155']?.chains?.[0])
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!signClient) return

    const handleSessionUpdate = ({ topic, params }: { topic: string; params: any }) => {
      const { namespaces } = params
      const _session = signClient.session.get(topic)
      const updatedSession = { ..._session, namespaces }
      setSession(updatedSession)
    }

    signClient.on('session_update', handleSessionUpdate)

    return () => {
      signClient.off('session_update', handleSessionUpdate)
    }
  }, [signClient])

  return (
    <div className="page-container">
      <Header />

      <ActionButtonList
        signClient={signClient}
        session={session}
        account={account}
        onSessionChange={setSession}
        onAccountChange={setAccount}
        onNetworkChange={setNetwork}
      />

      <InfoList account={account} network={network} session={session} />

      <Footer />
    </div>
  )
}
