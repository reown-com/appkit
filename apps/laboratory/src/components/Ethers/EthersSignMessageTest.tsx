import { Button } from '@chakra-ui/react'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { toast } from 'sonner'

export function EthersSignMessageTest() {
  const { address, chainId } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignMessage() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = new JsonRpcSigner(provider, address)
      const signature = await signer?.signMessage('Hello Web3Modal Ethers')
      toast.success(ConstantsUtil.SigningSucceededToastTitle, {
        description: signature
      })
    } catch {
      toast.error(ConstantsUtil.SigningFailedToastTitle, {
        description: 'Failed to sign message'
      })
    }
  }

  return (
    <Button data-testid="sign-message-button" onClick={onSignMessage}>
      Sign Message
    </Button>
  )
}
