import { useSnsName } from '@web3modal/react'

export default function UseSnsName() {
  const address = 'FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ'
  const { data, isLoading, error, refetch } = useSnsName(address)

  return (
    <section>
      <h1>useSnsName</h1>
      <ul>
        <li>
          Address: <span>{address}</span>
        </li>
        <li>
          Name: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch Sns</button>
    </section>
  )
}
