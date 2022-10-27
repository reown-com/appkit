import { useAccount, Web3Button } from '@web3modal/react'
import UseAccount from '../sections/UseAccount'
import UseBalance from '../sections/UseBalance'
import UseBlockNumber from '../sections/UseBlockNumber'
import UseContract from '../sections/UseContract'
import UseContractEvent from '../sections/UseContractEvent'
import UseContractRead from '../sections/UseContractRead'
import UseContractWrite from '../sections/UseContractWrite'
import UseDisconnect from '../sections/UseDisconnect'
import UseEnsAddress from '../sections/UseEnsAddress'
import UseEnsAvatar from '../sections/UseEnsAvatar'
import UseEnsName from '../sections/UseEnsName'
import UseEnsResolver from '../sections/UseEnsResolver'
import UseFeeData from '../sections/UseFeeData'
import UseNetwork from '../sections/UseNetwork'
import UseProvider from '../sections/UseProvider'
import UsePrepareSendWaitTransaction from '../sections/UseSendTransaction'
import UseSigner from '../sections/UseSigner'
import UseSignMessage from '../sections/UseSignMessage'
import UseSignTypedData from '../sections/UseSignTypedData'
import UseSwitchNetwork from '../sections/UseSwitchNetwork'
import UseToken from '../sections/UseToken'
import UseTransaction from '../sections/UseTransaction'

export default function HomePage() {
  const { account } = useAccount()

  return (
    <>
      <Web3Button />
      {account.isConnected && (
        <>
          <UseAccount />
          <UseDisconnect />
          <UseNetwork />
          <UseSwitchNetwork />
          <UseBlockNumber />
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
          <UsePrepareSendWaitTransaction />
          <UseContract />
          <UseContractRead />
          <UseContractWrite />
          <UseContractEvent />
        </>
      )}
    </>
  )
}
