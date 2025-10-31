import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type Hex } from '@reown/appkit-common'

import { ConstantsUtil } from '../../src/smart-session/utils/ConstantUtils'
import {
  CoSignerApiError,
  CosignerService,
  sendCoSignerRequest
} from '../../src/smart-session/utils/CosignerService'
import type {
  ActivatePermissionsRequest,
  AddPermissionRequest,
  AddPermissionResponse
} from '../../src/smart-session/utils/TypeUtils'

// Mocking the global fetch function
const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe('CoSigner API Tests', () => {
  const projectId = 'test-project-id'
  const mockAddress = '0x1234567890123456789012345678901234567890'
  const mockUrl = `https://example.com/${encodeURIComponent(mockAddress)}`
  const mockHeaders = { 'Content-Type': 'application/json' }

  const mockAddPermissionRequest: AddPermissionRequest = {
    chainId: '0x1',
    expiry: Math.floor(Date.now() / 1000) + 3600,
    signer: {
      type: 'keys',
      data: {
        keys: [{ type: 'secp256k1', publicKey: '0x123456' }]
      }
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

  beforeEach(() => {
    mockFetch.mockReset() // Reset the mock before each test
  })

  describe('sendCoSignerRequest', () => {
    it('should successfully send a request and return the response', async () => {
      const mockResponse = {
        pci: 'test-pci',
        key: {
          type: 'secp256k1',
          publicKey: '0xtest-key'
        }
      }

      // Mock the fetch response
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      const response = await sendCoSignerRequest({
        url: mockUrl,
        request: mockAddPermissionRequest,
        headers: {},
        queryParams: { projectId }
      })
      const fullUrl = new URL(mockUrl)
      fullUrl.searchParams.append('projectId', projectId)
      expect(response).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        fullUrl.toString(),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining(mockHeaders),
          body: JSON.stringify(mockAddPermissionRequest)
        })
      )
    })

    it('should throw CoSignerApiError for 4xx errors', async () => {
      const mockErrorResponse = { error: 'Bad Request' }

      // Mock the fetch response for a bad request
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockErrorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      await expect(
        sendCoSignerRequest({
          url: mockUrl,
          request: mockAddPermissionRequest,
          headers: {},
          queryParams: { projectId }
        })
      ).rejects.toThrow(CoSignerApiError)
    })

    it('should throw CoSignerApiError for network errors', async () => {
      // Mock a network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        sendCoSignerRequest({
          url: mockUrl,
          request: mockAddPermissionRequest,
          headers: {},
          queryParams: { projectId }
        })
      ).rejects.toThrow(CoSignerApiError)
    })

    it('should handle custom transformation of request data', async () => {
      const mockResponse = { success: true }
      const transformRequest = vi.fn(data => ({ ...data, transformed: true }))

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      await sendCoSignerRequest({
        url: mockUrl,
        request: mockAddPermissionRequest,
        headers: {},
        queryParams: { projectId },
        transformRequest
      })

      expect(transformRequest).toHaveBeenCalledWith(mockAddPermissionRequest)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ ...mockAddPermissionRequest, transformed: true })
        })
      )
    })
  })

  describe('CosignerService', () => {
    let cosigner: CosignerService

    beforeEach(() => {
      cosigner = new CosignerService(projectId)
    })

    it('should successfully add a permission', async () => {
      const mockResponse: AddPermissionResponse = {
        pci: 'test-pci',
        key: {
          type: 'secp256k1',
          publicKey: '0xtest-key'
        }
      }

      // Mock the fetch response for adding permission
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      const result = await cosigner.addPermission(mockAddress, mockAddPermissionRequest)

      expect(result).toEqual(mockResponse)

      const expectedUrl = `${ConstantsUtil.COSIGNER_BASE_URL}/${encodeURIComponent(
        mockAddress
      )}?projectId=${encodeURIComponent(projectId)}&v=2`

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining(mockHeaders),
          body: JSON.stringify(mockAddPermissionRequest)
        })
      )
    })

    it('should handle addPermission error and throw CoSignerApiError', async () => {
      // Mock the fetch response for a bad request when adding permission
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Bad Request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      await expect(cosigner.addPermission(mockAddress, mockAddPermissionRequest)).rejects.toThrow(
        CoSignerApiError
      )
    })

    it('should activate permissions successfully', async () => {
      // Mock successful activation response
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 204,
          headers: { 'Content-Length': '0' }
        })
      )

      await expect(
        cosigner.activatePermissions(mockAddress, mockActivatePermissionsRequest)
      ).resolves.toBeUndefined()

      const expectedUrl = `${ConstantsUtil.COSIGNER_BASE_URL}/${encodeURIComponent(
        mockAddress
      )}/activate?projectId=${encodeURIComponent(projectId)}`

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining(mockHeaders),
          body: JSON.stringify(mockActivatePermissionsRequest)
        })
      )
    })

    it('should throw CoSignerApiError for activatePermissions errors', async () => {
      // Mock the fetch response for a bad request when activating permissions
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Bad Request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      await expect(
        cosigner.activatePermissions(mockAddress, mockActivatePermissionsRequest)
      ).rejects.toThrow(CoSignerApiError)
    })

    it('should revoke permissions successfully', async () => {
      const mockPci = 'test-pci'
      const mockSignature = '0x1234567890abcdef' as Hex

      // Mock successful revocation response
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }))

      await expect(
        cosigner.revokePermissions(mockAddress, mockPci, mockSignature)
      ).resolves.toBeUndefined()

      const expectedUrl = `${ConstantsUtil.COSIGNER_BASE_URL}/${encodeURIComponent(
        mockAddress
      )}/revoke?projectId=${encodeURIComponent(projectId)}`

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining(mockHeaders),
          body: JSON.stringify({ pci: mockPci, signature: mockSignature })
        })
      )
    })

    describe('CosignerService Constructor', () => {
      it('should throw an error if projectId is not provided', () => {
        expect(() => new CosignerService('')).toThrow('Project ID must be provided')
      })

      it('should create an instance with a valid projectId', () => {
        const instance = new CosignerService('valid-project-id')

        expect(instance).toBeInstanceOf(CosignerService)
      })
    })
  })
})
