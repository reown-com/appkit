import { useAccount } from 'wagmi'

export function Account() {
  const { connector: _connector, ...account } = useAccount()

  return (
    <div
      style={{
        whiteSpace: 'pre',
        maxHeight: '30vh',
        overflow: 'auto',
        padding: '1rem',
        backgroundColor: 'var(--apkt-foreground-accent-primary-010)'
      }}
    >
      {JSON.stringify(account, null, 2)}
    </div>
  )
}
