import { DAI_CONTRACT } from '../constants'

export function getDaiContract(chainId: number, web3: any) {
  const dai = new web3.eth.Contract(
    DAI_CONTRACT[chainId].abi,
    DAI_CONTRACT[chainId].address
  )
  return dai
}

export function callBalanceOf(address: string, chainId: number, web3: any) {
  return new Promise(async(resolve, reject) => {
    const dai = getDaiContract(chainId, web3)

    await dai.methods
      .balanceOf(address)
      .call(
        { from: '0x0000000000000000000000000000000000000000' },
        (err: any, data: any) => {
          if (err) {
            reject(err)
          }

          resolve(data)
        }
      )
  })
}

export function callTransfer(address: string, chainId: number, web3: any) {
  return new Promise(async(resolve, reject) => {
    const dai = getDaiContract(chainId, web3)

    await dai.methods
      .transfer(address, '1')
      .send({ from: address }, (err: any, data: any) => {
        if (err) {
          reject(err)
        }

        resolve(data)
      })
  })
}
