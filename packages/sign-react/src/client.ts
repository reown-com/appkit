import type { Web3ModalSignOptions } from '@web3modal/sign-html'
import { Web3ModalSign } from '@web3modal/sign-html'
import mitt from 'mitt'

export const emitter = mitt()

let web3ModalSignClient: Web3ModalSign | undefined = undefined

export type Web3ModalSignInstance = InstanceType<typeof Web3ModalSign>

export function setWeb3ModalSignClient(options: Web3ModalSignOptions) {
  web3ModalSignClient = new Web3ModalSign(options)
}

export async function getWeb3ModalSignClient(): Promise<Web3ModalSign> {
  return new Promise(resolve => {
    if (web3ModalSignClient) {
      resolve(web3ModalSignClient)
    } else {
      const interval = setInterval(() => {
        if (web3ModalSignClient) {
          clearInterval(interval)
          resolve(web3ModalSignClient)
        }
      }, 200)
    }
  })
}
