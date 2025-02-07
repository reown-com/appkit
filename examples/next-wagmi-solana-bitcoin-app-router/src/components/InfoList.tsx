'use client'

import {
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useWalletInfo
} from '@/config'

export function InfoList() {
  const accountState = useAppKitAccount()
  const eip155AccountState = useAppKitAccount({ namespace: 'eip155' })
  const solanaAccountState = useAppKitAccount({ namespace: 'solana' })
  const bip122AccountState = useAppKitAccount({ namespace: 'bip122' })
  const networkState = useAppKitNetwork()
  const themeState = useAppKitTheme()
  const appKitState = useAppKitState()
  const eventsState = useAppKitEvents()
  const walletState = useWalletInfo()

  return (
    <div className="code-container-wrapper">
      <section className="code-container">
        <h2 className="code-container-title">useAppKitAccount - EVM</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(eip155AccountState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitAccount - Solana</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(solanaAccountState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitAccount - Bitcoin</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(bip122AccountState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitAccount()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(accountState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitNetwork()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(networkState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitTheme()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(themeState, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">useAppKitState()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(appKitState, null, 2)}</pre>
        </div>
      </section>
      <section className="code-container">
        <h2 className="code-container-title">useAppKitEvents()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(eventsState, null, 2)}</pre>
        </div>
      </section>
      <section className="code-container">
        <h2 className="code-container-title">useWalletInfo()</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(walletState, null, 2)}</pre>
        </div>
      </section>
    </div>
  )
}
