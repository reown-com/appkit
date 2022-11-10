import { useAccount, useConnectModal, Web3Button } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseContract from '../sections/UseContract'
import UseContractEvent from '../sections/UseContractEvent'
import UseContractRead from '../sections/UseContractRead'
import UseContractWrite from '../sections/UseContractWrite'
import UseDisconnect from '../sections/UseDisconnect'

export default function HomePage() {
  const { account } = useAccount()
  const { open } = useConnectModal()

  return (
    <>
      <Web3Button />
      <p>or</p>
      <button onClick={() => open()}>Custom Button</button>
      {account.isConnected && (
        <>
          <UseAccount />
          <UseDisconnect />
          {/* <UseNetwork />
          <UseSwitchNetwork /> */}
          {/* <UseBlockNumber />
          <UseFeeData />
          <UseBalance />
          <UseProvider />
          <UseSigner />
          <UseSignMessage />
          <UseSignTypedData />
          <UseEnsAddress />
          <UseEnsAvatar />
          <UseEnsName />
          <UseEnsResolver />
          <UseToken />
          <UseTransaction />
          <UsePrepareSendWaitTransaction /> */}
          <UseContract />
          <UseContractRead />
          <UseContractWrite />
          <UseContractEvent />
        </>
      )}
    </>
  )
}
