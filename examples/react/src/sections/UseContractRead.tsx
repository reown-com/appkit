import { chains } from '@web3modal/ethereum'
import { useContractRead } from '@web3modal/react'
import wagmigotchiAbi from '../data/wagmigotchiAbi.json'

export default function UseContractRead() {
  const config = {
    addressOrName: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    contractInterface: wagmigotchiAbi,
    functionName: 'getHunger',
    chainId: chains.mainnet.id
  }
  const { data, error, isLoading, refetch } = useContractRead(config)

  return (
    <section>
      <h1>useContractRead</h1>

      <p>
        This example uses
        <a
          href="https://testnet.snowtrace.io/address/0x1648C14DbB6ccdd5846969cE23DeEC4C66a03335#code"
          target="_blank"
          rel="noopener noreferer"
        >
          WagmiGotchi Contract
        </a>
        on Ethereum
      </p>

      <ul>
        <li>
          Contract read config: <span>{JSON.stringify(config)}</span>
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
