import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { W3mFrame } from '../src/W3mFrame.js'
import { W3mFrameHelpers } from '../src/W3mFrameHelpers.js'
import { W3mFrameConstants } from '../src/W3mFrameConstants.js'

describe('W3mFrame', () => {
  const PROJECT_ID = 'test-project-id'
  let w3mFrame: W3mFrame
  let mockWindow: any
  let mockDocument: any

  beforeEach(() => {
    // Mock client-side environment
    vi.spyOn(W3mFrameHelpers, 'isClient', 'get').mockReturnValue(true)

    // Create a mock window and document
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn()
    }
    mockDocument = {
      createElement: vi.fn().mockReturnValue({
        style: {},
        addEventListener: vi.fn(),
        setAttribute: vi.fn()
      }),
      body: {
        appendChild: vi.fn()
      },
      getElementById: vi.fn().mockReturnValue(null)
    }

    // Temporarily replace global window and document
    global.window = mockWindow as any
    global.document = mockDocument as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create an iframe when isAppClient is true', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)

      expect(mockDocument.createElement).toHaveBeenCalledWith('iframe')
      expect(w3mFrame.frameLoadPromise).toBeDefined()
    })

    it('should not create an iframe when isAppClient is false', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, false)

      expect(mockDocument.createElement).not.toHaveBeenCalled()
    })
  })

  describe('events', () => {
    it('should register frame event handler', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)
      const mockCallback = vi.fn()
      const mockAbortController = new AbortController()

      w3mFrame.events.registerFrameEventHandler('test-id', mockCallback, mockAbortController.signal)

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })

    it('should post app events', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)

      // Mock iframe and its contentWindow
      w3mFrame['iframe'] = {
        contentWindow: {
          postMessage: vi.fn()
        }
      } as any

      const testEvent = {
        id: 'test-id',
        type: W3mFrameConstants.APP_GET_CHAIN_ID
      }

      w3mFrame.events.postAppEvent(testEvent)

      expect(w3mFrame['iframe']?.contentWindow?.postMessage).toHaveBeenCalledWith(
        expect.objectContaining(testEvent),
        '*'
      )
    })

    it('should throw error when posting app event without iframe', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)

      const testEvent = {
        id: 'test-id',
        type: W3mFrameConstants.APP_GET_CHAIN_ID
      }

      expect(() => w3mFrame.events.postAppEvent(testEvent)).toThrowError(
        'W3mFrame: iframe is not set'
      )
    })
  })

  describe('initFrame', () => {
    it('should append iframe to document body when not already present', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)
      w3mFrame.initFrame()

      expect(mockDocument.body.appendChild).toHaveBeenCalledWith(w3mFrame['iframe'])
    })

    it('should not append iframe if already present', () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)

      // Mock iframe already existing
      mockDocument.getElementById.mockReturnValueOnce({})
      w3mFrame.initFrame()

      expect(mockDocument.body.appendChild).not.toHaveBeenCalled()
    })
  })

  describe('frame load promise', () => {
    it('should resolve when frame is ready', async () => {
      w3mFrame = new W3mFrame(PROJECT_ID, true)

      // Simulate frame ready event
      const readyEvent = {
        type: '@w3m-frame/READY'
      }

      // Trigger the onFrameEvent callback
      w3mFrame.events.onFrameEvent(event => {
        if (event.type === '@w3m-frame/READY') {
          w3mFrame['frameLoadPromiseResolver']?.resolve(undefined)
        }
      })

      // Simulate receiving the ready event
      const messageEvent = new MessageEvent('message', {
        data: {
          type: '@w3m-frame/READY',
          id: 'some-id',
          payload: {}
        }
      })
      mockWindow.addEventListener.mock.calls[0][1](messageEvent)

      // Wait for the promise to resolve
      await expect(w3mFrame.frameLoadPromise).resolves.toBeUndefined()
    })
  })
})
