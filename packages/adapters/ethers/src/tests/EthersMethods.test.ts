// Import mocked modules after mocking
import {
  BrowserProvider,
  Contract,
  InfuraProvider,
  JsonRpcSigner,
  hexlify,
  isHexString,
  toUtf8Bytes
} from 'ethers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { WcHelpersUtil } from '@reown/appkit'
import { isReownName } from '@reown/appkit-common'

import { EthersMethods } from '../utils/EthersMethods'

// Adjust path as needed

// Mock ethers modules
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers')
  return {
    ...actual,
    BrowserProvider: vi.fn(),
    Contract: vi.fn(),
    InfuraProvider: vi.fn(),
    JsonRpcSigner: vi.fn(),
    hexlify: vi.fn(() => '0xmockedhex'),
    isHexString: vi.fn(),
    toUtf8Bytes: vi.fn(() => 'mockedBytes'),
    // Keep these as pass-through to actual implementations
    parseUnits: actual['parseUnits'],
    formatUnits: actual['formatUnits']
  }
})

// Mock WcHelpersUtil
vi.mock('@reown/appkit', () => ({
  WcHelpersUtil: {
    resolveReownName: vi.fn()
  }
}))

// Mock isReownName
vi.mock('@reown/appkit-common', () => ({
  isReownName: vi.fn()
}))

describe('EthersMethods', () => {
  // Mock provider that mimics the behavior of a web3 provider
  const mockProvider = {
    request: vi.fn()
  }

  // Mock transaction objects
  const mockTxResponse = {
    wait: vi.fn()
  }

  // Mock signer
  const mockSigner = {
    estimateGas: vi.fn(),
    sendTransaction: vi.fn()
  }

  // Mock contract
  const mockContract = {}

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()

    // Setup default mocks
    mockProvider.request.mockResolvedValue('0xsignature')
    mockTxResponse.wait.mockResolvedValue({ hash: '0xtxhash' })
    mockSigner.estimateGas.mockResolvedValue(BigInt(21000))
    mockSigner.sendTransaction.mockResolvedValue(mockTxResponse)

    // Setup Browser Provider mock
    ;(BrowserProvider as any).mockImplementation(() => ({
      getSigner: vi.fn()
    }))

    // Setup JsonRpcSigner mock
    ;(JsonRpcSigner as any).mockImplementation(() => mockSigner)

    // Setup InfuraProvider mock
    ;(InfuraProvider as any).mockImplementation(() => ({
      resolveName: vi.fn().mockResolvedValue('0xmockaddress'),
      getAvatar: vi.fn().mockResolvedValue('https://example.com/avatar.png')
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('signMessage', () => {
    it('should sign a message using personal_sign', async () => {
      // Setup
      const message = 'Hello, world!'
      const address = '0x1234567890123456789012345678901234567890'
      const expectedSignature = '0xsignature'

      vi.mocked(isHexString).mockReturnValue(true)

      // Execute
      const result = await EthersMethods.signMessage(message, mockProvider as any, address)

      // Verify
      expect(isHexString).toHaveBeenCalledWith(message)
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'personal_sign',
        params: [message, address]
      })
      expect(result).toBe(expectedSignature)
    })

    it('should handle hex messages correctly', async () => {
      // Setup
      const hexMessage = '0x48656c6c6f2c20776f726c6421' // "Hello, world!" in hex
      const address = '0x1234567890123456789012345678901234567890'

      vi.mocked(isHexString).mockReturnValue(true)

      // Execute
      await EthersMethods.signMessage(hexMessage, mockProvider as any, address)

      // Verify
      expect(isHexString).toHaveBeenCalledWith(hexMessage)
      expect(toUtf8Bytes).not.toHaveBeenCalled()
      expect(hexlify).not.toHaveBeenCalled()
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'personal_sign',
        params: [hexMessage, address]
      })
    })

    it('should throw an error if provider is undefined', async () => {
      // Setup
      const message = 'Hello, world!'
      const address = '0x1234567890123456789012345678901234567890'

      // Execute & Verify
      await expect(EthersMethods.signMessage(message, undefined as any, address)).rejects.toThrow(
        'signMessage - provider is undefined'
      )
    })
  })

  describe('estimateGas', () => {
    // Setup common test variables
    const address = '0x1234567890123456789012345678901234567890'
    const networkId = 1
    const transactionData = {
      address,
      to: '0x0987654321098765432109876543210987654321',
      data: '0xdata',
      chainNamespace: 'eip155'
    }

    it('should estimate gas for a transaction', async () => {
      // Setup
      const expectedGas = BigInt(21000)

      // Execute
      const result = await EthersMethods.estimateGas(
        transactionData as any,
        mockProvider as any,
        address,
        networkId
      )

      // Verify
      expect(BrowserProvider).toHaveBeenCalledWith(mockProvider, networkId)
      expect(JsonRpcSigner).toHaveBeenCalled()
      expect(mockSigner.estimateGas).toHaveBeenCalledWith({
        from: address,
        to: transactionData.to,
        data: transactionData.data,
        type: 0
      })
      expect(result).toBe(expectedGas)
    })

    it('should throw an error if provider is undefined', async () => {
      await expect(
        EthersMethods.estimateGas(transactionData as any, undefined as any, address, networkId)
      ).rejects.toThrow('estimateGas - provider is undefined')
    })

    it('should throw an error if address is undefined', async () => {
      await expect(
        EthersMethods.estimateGas(transactionData as any, mockProvider as any, '', networkId)
      ).rejects.toThrow('estimateGas - address is undefined')
    })

    it('should throw an error if chainNamespace is not eip155', async () => {
      const invalidData = {
        ...transactionData,
        chainNamespace: 'solana'
      }

      await expect(
        EthersMethods.estimateGas(invalidData as any, mockProvider as any, address, networkId)
      ).rejects.toThrow('estimateGas - chainNamespace is not eip155')
    })
  })

  describe('sendTransaction', () => {
    // Setup common test variables
    const address = '0x1234567890123456789012345678901234567890'
    const networkId = 1
    const transactionData = {
      to: '0x0987654321098765432109876543210987654321',
      value: '0x123',
      gas: '0x5208', // 21000 in hex
      gasPrice: '0x4a817c800', // 20 Gwei in hex
      data: '0xdata',
      chainNamespace: 'eip155'
    }

    it('should send a transaction and return the transaction hash', async () => {
      // Setup
      const expectedHash = '0xtxhash'

      // Execute
      const result = await EthersMethods.sendTransaction(
        transactionData as any,
        mockProvider as any,
        address,
        networkId
      )

      // Verify
      expect(BrowserProvider).toHaveBeenCalledWith(mockProvider, networkId)
      expect(JsonRpcSigner).toHaveBeenCalled()
      expect(mockSigner.sendTransaction).toHaveBeenCalledWith({
        to: transactionData.to,
        value: transactionData.value,
        gasLimit: transactionData.gas,
        gasPrice: transactionData.gasPrice,
        data: transactionData.data,
        type: 0
      })
      expect(mockTxResponse.wait).toHaveBeenCalled()
      expect(result).toBe(expectedHash)
    })

    it('should return null if transaction receipt has no hash', async () => {
      // Setup
      mockTxResponse.wait.mockResolvedValue({})

      // Execute
      const result = await EthersMethods.sendTransaction(
        transactionData as any,
        mockProvider as any,
        address,
        networkId
      )

      // Verify
      expect(result).toBeNull()
    })

    it('should throw an error if provider is undefined', async () => {
      await expect(
        EthersMethods.sendTransaction(transactionData as any, undefined as any, address, networkId)
      ).rejects.toThrow('sendTransaction - provider is undefined')
    })

    it('should throw an error if address is undefined', async () => {
      await expect(
        EthersMethods.sendTransaction(transactionData as any, mockProvider as any, '', networkId)
      ).rejects.toThrow('sendTransaction - address is undefined')
    })

    it('should throw an error if chainNamespace is not eip155', async () => {
      const invalidData = {
        ...transactionData,
        chainNamespace: 'solana'
      }

      await expect(
        EthersMethods.sendTransaction(invalidData as any, mockProvider as any, address, networkId)
      ).rejects.toThrow('sendTransaction - chainNamespace is not eip155')
    })
  })

  describe('writeContract', () => {
    // Setup common test variables
    const address = '0x1234567890123456789012345678901234567890'
    const chainId = 1
    const contractData = {
      tokenAddress: '0xcontractAddress',
      abi: ['function transfer(address to, uint256 amount)'],
      method: 'transfer',
      args: ['0xrecipient', '1000000000000000000'] // 1 ETH in wei
    }

    it('should execute a contract method successfully', async () => {
      // Setup
      const expectedResult = { hash: '0xtxhash' }
      const mockTransfer = vi.fn().mockResolvedValue(expectedResult)

      // Setup mock Contract
      Object.assign(mockContract, { transfer: mockTransfer })
      ;(Contract as any).mockImplementation(() => mockContract)

      // Execute
      const result = await EthersMethods.writeContract(
        contractData as any,
        mockProvider as any,
        address,
        chainId
      )

      // Verify
      expect(BrowserProvider).toHaveBeenCalledWith(mockProvider, chainId)
      expect(JsonRpcSigner).toHaveBeenCalled()
      expect(Contract).toHaveBeenCalledWith(contractData.tokenAddress, contractData.abi, mockSigner)
      expect(mockTransfer).toHaveBeenCalledWith(...contractData.args)
      expect(result).toEqual(expectedResult)
    })

    it('should throw an error if provider is undefined', async () => {
      await expect(
        EthersMethods.writeContract(contractData as any, undefined as any, address, chainId)
      ).rejects.toThrow('writeContract - provider is undefined')
    })

    it('should throw an error if address is undefined', async () => {
      await expect(
        EthersMethods.writeContract(contractData as any, mockProvider as any, '', chainId)
      ).rejects.toThrow('writeContract - address is undefined')
    })

    it('should throw an error if contract method is undefined', async () => {
      // Setup
      const invalidData = {
        ...contractData,
        method: undefined
      }

      // Mock empty contract
      ;(Contract as any).mockImplementation(() => ({}))

      await expect(
        EthersMethods.writeContract(invalidData as any, mockProvider as any, address, chainId)
      ).rejects.toThrow('Contract method is undefined')
    })

    it('should throw if the method does not exist on the contract', async () => {
      // Setup
      const invalidMethodData = {
        ...contractData,
        method: 'nonExistentMethod'
      }

      // Mock contract without the requested method
      ;(Contract as any).mockImplementation(() => ({}))

      await expect(
        EthersMethods.writeContract(invalidMethodData as any, mockProvider as any, address, chainId)
      ).rejects.toThrow('Contract method is undefined')
    })
  })

  describe('getEnsAddress', () => {
    const caipNetwork = { id: '1' }

    it('should resolve an ENS name on mainnet', async () => {
      // Setup
      const ensName = 'vitalik.eth'
      const resolvedAddress = '0xmockaddress'

      // Mock dependencies
      vi.mocked(isReownName).mockReturnValue(false)
      const mockResolveName = vi.fn().mockResolvedValue(resolvedAddress)
      ;(InfuraProvider as any).mockImplementation(() => ({
        resolveName: mockResolveName
      }))

      // Execute
      const result = await EthersMethods.getEnsAddress(ensName, caipNetwork as any)

      // Verify
      expect(isReownName).toHaveBeenCalledWith(ensName)
      expect(InfuraProvider).toHaveBeenCalledWith('mainnet')
      expect(mockResolveName).toHaveBeenCalledWith(ensName)
      expect(result).toBe(resolvedAddress)
    })

    it('should resolve a ReownName if available', async () => {
      // Setup
      const wcName = 'user.reown'
      const resolvedAddress = '0xwcaddress'

      // Mock dependencies
      vi.mocked(isReownName).mockReturnValue(true)
      vi.spyOn(WcHelpersUtil, 'resolveReownName').mockResolvedValue(resolvedAddress)

      // Mock ENS resolution (returns null for ReownName)
      const mockResolveName = vi.fn().mockResolvedValue(null)
      ;(InfuraProvider as any).mockImplementation(() => ({
        resolveName: mockResolveName
      }))

      // Execute
      const result = await EthersMethods.getEnsAddress(wcName, caipNetwork as any)

      // Verify
      expect(isReownName).toHaveBeenCalledWith(wcName)
      expect(WcHelpersUtil.resolveReownName).toHaveBeenCalledWith(wcName)
      expect(result).toBe(resolvedAddress)
    })

    it('should return false if neither ENS nor ReownName resolves', async () => {
      // Setup
      const invalidName = 'nonexistent.xyz'

      // Mock dependencies
      vi.mocked(isReownName).mockReturnValue(false)

      // Mock ENS resolution (returns null)
      const mockResolveName = vi.fn().mockResolvedValue(null)
      ;(InfuraProvider as any).mockImplementation(() => ({
        resolveName: mockResolveName
      }))

      // Execute
      const result = await EthersMethods.getEnsAddress(invalidName, caipNetwork as any)

      // Verify
      expect(result).toBe(false)
    })

    it('should return false if there is an error', async () => {
      // Setup
      const ensName = 'vitalik.eth'

      // Mock dependencies
      vi.mocked(isReownName).mockReturnValue(false)

      // Mock InfuraProvider to throw an error
      ;(InfuraProvider as any).mockImplementation(() => {
        throw new Error('Network error')
      })

      // Execute
      const result = await EthersMethods.getEnsAddress(ensName, caipNetwork as any)

      // Verify
      expect(result).toBe(false)
    })
  })

  describe('getEnsAvatar', () => {
    it('should get an ENS avatar on mainnet', async () => {
      // Setup
      const ensName = 'vitalik.eth'
      const avatarUrl = 'https://example.com/avatar.png'
      const chainId = 1 // Mainnet

      // Mock InfuraProvider
      const mockGetAvatar = vi.fn().mockResolvedValue(avatarUrl)
      ;(InfuraProvider as any).mockImplementation(() => ({
        getAvatar: mockGetAvatar
      }))

      // Execute
      const result = await EthersMethods.getEnsAvatar(ensName, chainId)

      // Verify
      expect(InfuraProvider).toHaveBeenCalledWith('mainnet')
      expect(mockGetAvatar).toHaveBeenCalledWith(ensName)
      expect(result).toBe(avatarUrl)
    })

    it('should return false if no avatar is found', async () => {
      // Setup
      const ensName = 'vitalik.eth'
      const chainId = 1 // Mainnet

      // Mock InfuraProvider (avatar not found)
      const mockGetAvatar = vi.fn().mockResolvedValue(null)
      ;(InfuraProvider as any).mockImplementation(() => ({
        getAvatar: mockGetAvatar
      }))

      // Execute
      const result = await EthersMethods.getEnsAvatar(ensName, chainId)

      // Verify
      expect(result).toBe(false)
    })

    it('should return false for non-mainnet chains', async () => {
      // Setup
      const ensName = 'vitalik.eth'
      const chainId = 5 // Goerli

      // Execute
      const result = await EthersMethods.getEnsAvatar(ensName, chainId)

      // Verify
      expect(InfuraProvider).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })

  describe('parseWalletCapabilities', () => {
    it('should parse valid JSON string', () => {
      // Setup
      const validJson = '{"method1":true,"method2":false}'
      const expected = { method1: true, method2: false }

      // Execute
      const result = EthersMethods.parseWalletCapabilities(validJson)

      // Verify
      expect(result).toEqual(expected)
    })

    it('should throw an error for invalid JSON', () => {
      // Setup
      const invalidJson = '{method1:true,method2:false}'

      // Execute & Verify
      expect(() => EthersMethods.parseWalletCapabilities(invalidJson)).toThrow(
        'Error parsing wallet capabilities'
      )
    })
  })
})
