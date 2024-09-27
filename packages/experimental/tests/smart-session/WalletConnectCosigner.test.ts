import { describe, expect, it, beforeAll, beforeEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {
  sendCoSignerRequest,
  CoSignerApiError,
  WalletConnectCosigner
} from '../../src/smart-session/utils/WalletConnectCosigner'
import { ConstantsUtil } from '../../src/smart-session/utils/ConstantUtils'
import type {
  SmartSessionGrantPermissionsRequest,
  ActivatePermissionsRequest
} from '../../src/smart-session/utils/TypeUtils'

// Setup mock adapter for axios
const mock = new MockAdapter(axios)

describe('CoSigner API Tests', () => {
  const projectId = 'test-project-id'
  const mockAddress = '0x1234567890123456789012345678901234567890'
  let cosigner: WalletConnectCosigner

  beforeAll(() => {
    cosigner = new WalletConnectCosigner(projectId)
  })

  beforeEach(() => {
    mock.reset()
  })

  // Mock data
  const mockAddPermissionRequest: SmartSessionGrantPermissionsRequest = {
    chainId: '0x1',
    expiry: Math.floor(Date.now() / 1000) + 3600,
    signer: {
      type: 'key',
      data: { type: 'secp256k1', publicKey: '0x123456' }
    },
    permissions: [
      {
        type: 'contract-call',
        data: {
          address: '0x2E65BAfA07238666c3b239E94F32DaD3cDD6498D',
          abi: [],
          functions: []
        }
      }
    ],
    policies: []
  }

  const mockActivatePermissionsRequest: ActivatePermissionsRequest = {
    ...mockAddPermissionRequest,
    pci: 'test-pci',
    context: '0xtest-context'
  }

  describe('sendCoSignerRequest', () => {
    const mockUrl = 'https://example.com'
    const mockHeaders = { 'Content-Type': 'application/json' }

    it('should successfully send a request and return the response', async () => {
      const mockResponse = { pci: 'test-pci', key: '0xtest-key' }
      mock.onPost(mockUrl).reply(200, mockResponse)

      const response = await sendCoSignerRequest({
        url: mockUrl,
        request: mockAddPermissionRequest,
        headers: mockHeaders,
        queryParams: { projectId }
      })

      expect(response).toEqual(mockResponse)
    })

    it('should throw CoSignerApiError with a response status and message for 4xx errors', async () => {
      mock.onPost(mockUrl).reply(400, { error: 'Bad Request' })

      await expect(
        sendCoSignerRequest({
          url: mockUrl,
          request: mockAddPermissionRequest,
          headers: mockHeaders,
          queryParams: { projectId }
        })
      ).rejects.toThrow(CoSignerApiError)
    })

    it('should throw CoSignerApiError for network errors', async () => {
      mock.onPost(mockUrl).networkError()

      await expect(
        sendCoSignerRequest({
          url: mockUrl,
          request: mockAddPermissionRequest,
          headers: mockHeaders,
          queryParams: { projectId }
        })
      ).rejects.toThrow(CoSignerApiError)
    })
  })

  describe('WalletConnectCosigner', () => {
    describe('addPermission', () => {
      it('should successfully add a permission', async () => {
        const mockResponse = { pci: 'test-pci', key: '0xtest-key' }
        mock
          .onPost(`${ConstantsUtil.WC_COSIGNER_BASE_URL}/${encodeURIComponent(mockAddress)}`)
          .reply(200, mockResponse)

        const result = await cosigner.addPermission(mockAddress, mockAddPermissionRequest)

        expect(result).toEqual(mockResponse)
      })

      it('should handle addPermission error and throw CoSignerApiError', async () => {
        mock
          .onPost(`${ConstantsUtil.WC_COSIGNER_BASE_URL}/${encodeURIComponent(mockAddress)}`)
          .reply(400, { error: 'Bad Request' })

        await expect(cosigner.addPermission(mockAddress, mockAddPermissionRequest)).rejects.toThrow(
          CoSignerApiError
        )
      })
    })

    describe('activatePermissions', () => {
      it('should activate permissions successfully', async () => {
        mock
          .onPost(
            `${ConstantsUtil.WC_COSIGNER_BASE_URL}/${encodeURIComponent(mockAddress)}/activate`
          )
          .reply(200)

        await expect(
          cosigner.activatePermissions(mockAddress, mockActivatePermissionsRequest)
        ).resolves.toBeUndefined()
      })

      it('should handle activatePermissions error and throw CoSignerApiError', async () => {
        mock
          .onPost(
            `${ConstantsUtil.WC_COSIGNER_BASE_URL}/${encodeURIComponent(mockAddress)}/activate`
          )
          .reply(400, { error: 'Bad Request' })

        await expect(
          cosigner.activatePermissions(mockAddress, mockActivatePermissionsRequest)
        ).rejects.toThrow(CoSignerApiError)
      })
    })
  })

  describe('WalletConnectCosigner Constructor', () => {
    it('should throw an error if projectId is not provided', () => {
      expect(() => new WalletConnectCosigner('')).toThrow('Project ID must be provided')
    })

    it('should create an instance with a valid projectId', () => {
      const instance = new WalletConnectCosigner('valid-project-id')
      expect(instance).toBeInstanceOf(WalletConnectCosigner)
    })
  })
})
