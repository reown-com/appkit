import { useAccount, useConnectModal, Web3Button } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'

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
          {/* <UseDisconnect />
          <UseNetwork />
          <UseSwitchNetwork />
          <UseBlockNumber />
          <UseFeeData /> */}
          <UseBalance />
          {/* <UseProvider />
          <UseSigner />
          <UseSignMessage />
          <UseSignTypedData />
          <UseEnsAddress />
          <UseEnsAvatar />
          <UseEnsName />
          <UseEnsResolver />
          <UseToken />
          <UseTransaction />
          <UsePrepareSendWaitTransaction />
          <UseContract />
          <UseContractRead />
          <UseContractWrite />
          <UseContractEvent /> */}
        </>
      )}
    </>
  )
}
