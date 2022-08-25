import { Web3ModalCore } from './api'

if (typeof window !== 'undefined') window.Web3ModalCore = Web3ModalCore

declare global {
  interface Window {
    Web3ModalCore: typeof Web3ModalCore
  }
}
