import { useContract } from '@web3modal/react'
import ensRegistryAbi from '../data/ensRegistryAbi.json'

export default function UseContract() {
  const contract = useContract({
    addressOrName: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    contractInterface: ensRegistryAbi
  })

  return (
    <section>
      <h1>useContract</h1>

      <p>
        This example uses
        <a
          href="https://etherscan.io/address/0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e#code"
          target="_blank"
          rel="noopener noreferer"
        >
          ENS Registry Contract
        </a>
        on Ethereum
      </p>

      <ul>
        <li>
          Contract Address: <span>{contract?.address}</span>
        </li>
      </ul>
    </section>
  )
}
