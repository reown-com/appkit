export const SAFE_VERSION = '1.4.1'

export const ENTRY_POINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

export const EIP712_SAFE_OPERATION_TYPE = {
  SafeOp: [
    { type: 'address', name: 'safe' },
    { type: 'bytes', name: 'callData' },
    { type: 'uint256', name: 'nonce' },
    { type: 'uint256', name: 'preVerificationGas' },
    { type: 'uint256', name: 'verificationGasLimit' },
    { type: 'uint256', name: 'callGasLimit' },
    { type: 'uint256', name: 'maxFeePerGas' },
    { type: 'uint256', name: 'maxPriorityFeePerGas' },
    { type: 'address', name: 'entryPoint' }
  ]
}

export const SAFE_ADDRESSES_MAP = {
  '1.4.1': {
    11155111: {
      ADD_MODULES_LIB_ADDRESS: '0x191EFDC03615B575922289DC339F4c70aC5C30Af',
      SAFE_4337_MODULE_ADDRESS: '0x39E54Bb2b3Aa444b4B39DEe15De3b7809c36Fc38',
      SAFE_PROXY_FACTORY_ADDRESS: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
      SAFE_SINGLETON_ADDRESS: '0x41675C099F32341bf84BFc5382aF534df5C7461a'
    },
    5: {
      ADD_MODULES_LIB_ADDRESS: '0x191EFDC03615B575922289DC339F4c70aC5C30Af',
      SAFE_4337_MODULE_ADDRESS: '0x39E54Bb2b3Aa444b4B39DEe15De3b7809c36Fc38',
      SAFE_PROXY_FACTORY_ADDRESS: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
      SAFE_SINGLETON_ADDRESS: '0x41675C099F32341bf84BFc5382aF534df5C7461a'
    }
  }
} as const
