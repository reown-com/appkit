import { expect, it } from 'vitest'

import { CloudAuthSIWX, ReownAuthentication } from '../../src/configs/ReownAuthenticationSIWX'

it('should have same instance for CloudAuthSIWX and ReownAuthentication guaranteeing backwards compatibility', () => {
  expect(ReownAuthentication).toBe(CloudAuthSIWX)
  expect(new ReownAuthentication()).toBeInstanceOf(CloudAuthSIWX)
})
