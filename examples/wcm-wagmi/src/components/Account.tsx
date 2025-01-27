import { useAccount } from 'wagmi'

export function Account() {
  const { connector: _connector, ...account } = useAccount()

  return <div className="container__account_data">{JSON.stringify(account, null, 2)}</div>
}
