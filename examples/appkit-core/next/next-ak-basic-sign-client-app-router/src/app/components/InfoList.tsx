interface InfoListProps {
  account?: string
  network?: string
  session: any
}

export default function InfoList({ account, network, session }: InfoListProps) {
  return (
    <div className="code-container-wrapper">
      <section className="code-container">
        <h2 className="code-container-title">Account</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(account, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">Network</h2>
        <div className="code-container-content">
          <pre>{JSON.stringify(network, null, 2)}</pre>
        </div>
      </section>

      <section className="code-container">
        <h2 className="code-container-title">Session</h2>
        <div className="code-container-content">
          {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
        </div>
      </section>
    </div>
  )
}
