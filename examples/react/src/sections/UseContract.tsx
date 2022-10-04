import { useContract } from '@web3modal/react'
import wagmigotchiAbi from '../data/wagmigotchiAbi.json'

export default function UseContract() {
  const contract = useContract({
    addressOrName: '0xeCB504D39723b0be0e3a9Aa33D646642D1051EE1',
    contractInterface: wagmigotchiAbi
  })

  return (
    <section>
      <h1>useContract</h1>

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
          Contract Address: <span>{contract?.address}</span>
        </li>
      </ul>
    </section>
  )
}
