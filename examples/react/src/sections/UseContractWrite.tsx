import { modalChains } from '@web3modal/ethereum'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import wagmigotchiABI from '../data/wagmigotchiAbi.json'

export default function UseContractWrite() {
  const { config } = usePrepareContractWrite({
    address: '0xecb504d39723b0be0e3a9aa33d646642d1051ee1',
    abi: wagmigotchiABI,
    functionName: 'feed',
    chainId: modalChains.mainnet.id
  })
  // @ts-expect-error Types are fine
  const { data, error, isLoading, write } = useContractWrite(config)
  const { data: waitData, isLoading: waitLoading } = useWaitForTransaction({ hash: data?.hash })

  function onWrite() {
    write?.()
  }

  return (
    <section>
      <h1>useContractWrite</h1>

      <p>
        This example uses
        <a
          href="https://etherscan.io/address/0xecb504d39723b0be0e3a9aa33d646642d1051ee1#code"
          target="_blank"
          rel="noopener noreferer"
        >
          WagmiGotchi Contract
        </a>
        on Ethereum
      </p>

      <ul>
        <li>
          Contract write Config: <span>{JSON.stringify(config)}</span>
        </li>
        <li>
          Write Data: <span>{isLoading ? 'Loading...' : JSON.stringify(data)}</span>
        </li>
        <li>
          Receipt Data: <span>{waitLoading ? 'Waiting...' : JSON.stringify(waitData)}</span>
        </li>
        <li>
          Error: <span>{error ? error.message : 'No Error'}</span>
        </li>
      </ul>
      <button onClick={onWrite}>Write to contract</button>
    </section>
  )
}
