/// <reference types="vitest" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TelemetryController } from '../src/controllers/TelemetryController.js'

// Mock dependencies
vi.mock('../src/utils/CoreHelperUtil', () => ({
  CoreHelperUtil: {
    getApiUrl: vi.fn(() => 'https://test-api.com'),
    getBlockchainApiUrl: vi.fn(() => 'https://test-blockchain-api.com'),
    getStagingApiUrl: vi.fn(() => 'https://test-staging-api.com'),
    getAnalyticsUrl: vi.fn(() => 'https://test-analytics.com'),
    getUUID: vi.fn(() => 'test-uuid')
  }
}))

vi.mock('../src/controllers/EventsController', () => ({
  EventsController: {
    getSdkProperties: vi.fn(() => ({ sdkVersion: 'test-version' }))
  }
}))

vi.mock('../src/utils/FetchUtil', () => ({
  FetchUtil: vi.fn().mockImplementation(() => ({
    post: vi.fn().mockResolvedValue({})
  }))
}))

describe('TelemetryController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    TelemetryController.clearEvents()
    TelemetryController.enable()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rate limiting', () => {
    it('should allow up to 5 errors per minute', async () => {
      const error = new Error('Test error')

      // Send 5 errors
      for (let i = 0; i < 5; i++) {
        await TelemetryController.sendError(error, 'API_ERROR')
      }

      // Verify 5 errors were sent
      expect(TelemetryController.state.events.length).toBe(5)

      // Try to send a 6th error
      await TelemetryController.sendError(error, 'API_ERROR')

      // Verify no additional error was sent
      expect(TelemetryController.state.events.length).toBe(5)
    })

    it('should allow new errors after a minute has passed', async () => {
      const error = new Error('Test error')

      // Send 5 errors
      for (let i = 0; i < 5; i++) {
        await TelemetryController.sendError(error, 'API_ERROR')
      }

      // Verify 5 errors were sent
      expect(TelemetryController.state.events.length).toBe(5)

      // Advance time by 2 minutes
      vi.advanceTimersByTime(2 * 60 * 1000)

      // Try to send a new error
      await TelemetryController.sendError(error, 'API_ERROR')

      // Verify the new error was sent
      expect(TelemetryController.state.events.length).toBe(6)
    })

    it('should not apply rate limiting when disabled', async () => {
      const error = new Error('Test error')

      // Disable telemetry
      TelemetryController.disable()

      // Try to send errors
      for (let i = 0; i < 10; i++) {
        await TelemetryController.sendError(error, 'API_ERROR')
      }

      // Verify no errors were sent
      expect(TelemetryController.state.events.length).toBe(0)
    })

    it('should clear rate limiting state when events are cleared', async () => {
      const error = new Error('Test error')

      // Send 5 errors
      for (let i = 0; i < 5; i++) {
        await TelemetryController.sendError(error, 'API_ERROR')
      }

      // Clear events
      TelemetryController.clearEvents()

      // Try to send new errors
      for (let i = 0; i < 5; i++) {
        await TelemetryController.sendError(error, 'API_ERROR')
      }

      // Verify new errors were sent
      expect(TelemetryController.state.events.length).toBe(5)
    })
  })
})
