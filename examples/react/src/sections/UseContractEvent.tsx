import { chains } from '@web3modal/ethereum'
import { useContractEvent } from '@web3modal/react'
import { useState } from 'react'
import ensRegistryABI from '../data/ensRegistryABI.json'

export default function UseContractEvent() {
  const [eventData, setEventData] = useState<unknown>(undefined)

  const config = {
    addressOrName: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    contractInterface: ensRegistryABI,
    eventName: 'NewOwner',
    listener: (event: unknown) => setEventData(event),
    chainId: chains.mainnet.id
  }

  useContractEvent(config)

  return (
    <section>
      <h1>useContractEvent</h1>

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
          Event data: <span>{JSON.stringify(eventData)}</span>
        </li>
      </ul>
    </section>
  )
}
