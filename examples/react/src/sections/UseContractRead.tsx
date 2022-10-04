import { useContractRead } from '@web3modal/react'
import wagmigotchiAbi from '../data/wagmigotchiAbi.json'

export default function UseContractRead() {
  const addressOrName = '0xecb504d39723b0be0e3a9aa33d646642d1051ee1'
  const { data, error, isLoading, refetch } = useContractRead({
    addressOrName,
    contractInterface: wagmigotchiAbi,
    functionName: 'getHunger'
  })

  return (
    <section>
      <h1>useContractRead</h1>

      <p>
        This example uses
        <a
          href="https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1"
          target="_blank"
          rel="noopener noreferer"
        >
          wagmigotchi
        </a>
        on Ethereum
      </p>

      <ul>
        <li>
          Contract Address: <span>{addressOrName}</span>
        </li>
        <li>
          Returned data: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={async () => refetch()}>Refetch data</button>
    </section>
  )
}
