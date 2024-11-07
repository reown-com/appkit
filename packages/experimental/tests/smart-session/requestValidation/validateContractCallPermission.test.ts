import { beforeEach, describe, expect, it } from 'vitest'
import { validateRequest } from '../../../src/smart-session/helper/index.js'
import type { SmartSessionGrantPermissionsRequest } from '../../../exports/smart-session/index.js'
import { donutContractAbi } from '../../data/abi.js'
import { ERROR_MESSAGES } from '../../../src/smart-session/schema/index.js'
import type { ContractCallPermission } from '../../../src/smart-session/utils/TypeUtils.js'
import { mockRequest } from './mockRequest.js'

describe('ContractCallPermission validation', () => {
  let testRequest: SmartSessionGrantPermissionsRequest

  beforeEach(() => {
    testRequest = {
      ...mockRequest(),
      permissions: []
    }
  })

  const validPermission = {
    type: 'contract-call',
    data: {
      address: '0x1234567890123456789012345678901234567890',
      abi: donutContractAbi,
      functions: [{ functionName: 'testFunction' }]
    }
  } as ContractCallPermission

  it('should pass for valid permissions array', () => {
    const request = {
      ...testRequest,
      permissions: [validPermission]
    }
    expect(() => validateRequest(request)).not.toThrow()
  })

  it('should pass for multiple valid permissions', () => {
    const request = {
      ...testRequest,
      permissions: [validPermission, validPermission]
    }
    expect(() => validateRequest(request)).not.toThrow()
  })

  it('should fail for empty permissions array', () => {
    const request = {
      ...testRequest,
      permissions: []
    }
    expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS)
  })

  it('should fail for non-array permissions', () => {
    const request = {
      ...testRequest,
      permissions: validPermission as any
    }
    expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_PERMISSIONS_TYPE)
  })

  it('should fail for invalid permission type', () => {
    const request = {
      ...testRequest,
      permissions: [{ ...validPermission, type: 'invalid-type' }] as any
    }
    expect(() => validateRequest(request)).toThrow(`Invalid permissions.0: Invalid input`)
  })

  it('should fail for missing address in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, address: undefined }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission] as any
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })

  it('should fail for invalid address format in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, address: '1234' }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission] as any
    }
    expect(() => validateRequest(request)).toThrow(ERROR_MESSAGES.INVALID_ADDRESS)
  })

  it('should fail for missing abi in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, abi: undefined }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission] as any
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })

  it('should fail for non-array abi in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, abi: {} as any }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission]
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })

  it('should fail for missing functions in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, functions: undefined }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission] as any
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })

  it('should fail for non-array functions in permission data', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, functions: {} as any }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission]
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })

  it('should fail for missing functionName in function permission', () => {
    const invalidPermission = {
      ...validPermission,
      data: { ...validPermission.data, functions: [{}] }
    }
    const request = {
      ...testRequest,
      permissions: [invalidPermission] as any
    }
    expect(() => validateRequest(request)).toThrow('Invalid permissions.0: Invalid input')
  })
})
