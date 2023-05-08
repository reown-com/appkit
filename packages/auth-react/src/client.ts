import type { Web3ModalAuthOptions } from '@web3modal/auth-html'
import { Web3ModalAuth } from '@web3modal/auth-html'

let web3ModalAuthClient: Web3ModalAuth | undefined = undefined

export function setWeb3ModalAuthClient(options: Web3ModalAuthOptions) {
  web3ModalAuthClient = new Web3ModalAuth(options)
}

export async function getWeb3ModalAuthClient(): Promise<Web3ModalAuth> {
  return new Promise(resolve => {
    if (web3ModalAuthClient) {
      resolve(web3ModalAuthClient)
    }
    const interval = setInterval(() => {
      if (web3ModalAuthClient) {
        clearInterval(interval)
        resolve(web3ModalAuthClient)
      }
    }, 100)
  })
}
