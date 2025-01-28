import { useState } from 'react'

import type { SessionTypes } from '@walletconnect/types'

import ActionButtonList from './components/ActionButton'
import Footer from './components/Footer'
import Header from './components/Header'
import InfoList from './components/InfoList'
import { signClient } from './config'

export default function App() {
  document.documentElement.className = 'light'

  const lastKeyIndex = signClient.session.getAll().length - 1
  const lastSession = signClient.session.getAll()[lastKeyIndex]

  const [session, setSession] = useState<SessionTypes.Struct | undefined>(lastSession)
  const [account, setAccount] = useState<string | undefined>(
    lastSession?.namespaces['eip155']?.accounts?.[0]?.split(':')[2]
  )
  const [network, setNetwork] = useState<string | undefined>(
    lastSession?.namespaces['eip155']?.chains?.[0]
  )

  signClient.on('session_update', ({ topic, params }) => {
    const { namespaces } = params
    const _session = signClient.session.get(topic)
    const updatedSession = { ..._session, namespaces }

    setSession(updatedSession)
  })

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
