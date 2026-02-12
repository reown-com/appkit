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
  const networkState = useAppKitNetwork()
  const themeState = useAppKitTheme()
  const appKitState = useAppKitState()
  const eventsState = useAppKitEvents()
  const walletState = useWalletInfo()

  return (
    <div className="code-container-wrapper">
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
