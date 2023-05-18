import type { Web3ModalSignOptions } from '@web3modal/sign-html'
import { Web3ModalSign } from '@web3modal/sign-html'

let web3ModalSignClient: Web3ModalSign | undefined = undefined

export function setWeb3ModalSignClient(options: Web3ModalSignOptions) {
  web3ModalSignClient = new Web3ModalSign(options)
}

export async function getWeb3ModalSignClient(): Promise<Web3ModalSign> {
  return new Promise(resolve => {
    if (web3ModalSignClient) {
      resolve(web3ModalSignClient)
    }
    const interval = setInterval(() => {
      if (web3ModalSignClient) {
        clearInterval(interval)
        resolve(web3ModalSignClient)
      }
    }, 100)
  })
}
