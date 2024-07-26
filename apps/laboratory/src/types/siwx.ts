export interface IVerifySignatureParams {
  address: string
  message: string
  signature: string
  chainId: number
}

export enum SiwxUriType {
  SIWS = 'siws',
  SIWE = 'siwe'
}
