import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type ThemeType, type ThemeVariables, getW3mThemeVariables } from '@reown/appkit-common'
import {
  type AuthConnector,
  ConnectorController,
  ModalController,
  OptionsController,
  ThemeController
} from '@reown/appkit-controllers'

import { W3mApproveTransactionView } from '../../src/views/w3m-approve-transaction-view/index'

// --- Types ---------------------------------------------------- //
interface MockResizeObserver extends ResizeObserver {
  triggerCallback(entries: Partial<ResizeObserverEntry>[]): void
}

// --- Constants ---------------------------------------------------- //
const FRAME_CONTAINER = '[data-ready]'
const IFRAME_ID = 'w3m-iframe'

const MOCK_AUTH_CONNECTOR = {
  provider: {
    syncTheme: vi.fn().mockResolvedValue(undefined)
  }
} as unknown as AuthConnector

const MOCK_THEME_SNAPSHOT = {
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent-color': '#3396ff',
    '--w3m-background-color': '#000000'
  }
} as unknown as ReturnType<typeof ThemeController.getSnapshot>

const MOCK_RECT = {
  left: 100,
  top: 200,
  width: 400,
  height: 600
} as DOMRect

beforeAll(() => {
  global.ResizeObserver = class {
    private callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void

    constructor(callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) {
      this.callback = callback
    }

    observe() {}
    unobserve() {}
    disconnect() {}

    triggerCallback(entries: Partial<ResizeObserverEntry>[]) {
      const mockEntries = entries.map(entry => ({
        contentBoxSize: entry.contentBoxSize || [],
        borderBoxSize: entry.borderBoxSize || [],
        contentRect: entry.contentRect || {
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        },
        devicePixelContentBoxSize: entry.devicePixelContentBoxSize || [],
        target: entry.target || document.body
      })) as ResizeObserverEntry[]
      this.callback(mockEntries, this)
    }
  }
})

beforeAll(() => {
  const mockIframe = document.createElement('iframe')
  mockIframe.id = IFRAME_ID
  mockIframe.style.display = 'none'
  document.body.appendChild(mockIframe)
})

describe('W3mApproveTransactionView - Basic Rendering', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableEmbedded: false
    })

    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR)
    vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue(MOCK_THEME_SNAPSHOT)
    vi.spyOn(ModalController, 'subscribeKey').mockReturnValue(() => {})
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render basic structure with frame container', async () => {
    const element = await fixture<W3mApproveTransactionView>(
      html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
    )
    await element.updateComplete

    const frameContainer = element.shadowRoot?.querySelector(FRAME_CONTAINER)

    expect(frameContainer).not.toBeNull()
    expect(frameContainer?.getAttribute('data-ready')).toBe('false')
    expect(frameContainer?.id).toBe('w3m-frame-container')
  })

  it('should initialize with ready state as false', async () => {
    const element = await fixture<W3mApproveTransactionView>(
      html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
    )
    await element.updateComplete

    expect(element.ready).toBe(false)
  })

  it('should subscribe to modal controller events on construction', async () => {
    const element = await fixture<W3mApproveTransactionView>(
      html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
    )

    await element.updateComplete

    expect(ModalController.subscribeKey).toHaveBeenCalledWith('open', expect.any(Function))
    expect(ModalController.subscribeKey).toHaveBeenCalledWith('shake', expect.any(Function))
  })

  it('should sync theme on first update', async () => {
    const element = await fixture<W3mApproveTransactionView>(
      html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
    )

    await element.updateComplete

    expect(ConnectorController.getAuthConnector).toHaveBeenCalled()
    expect(ThemeController.getSnapshot).toHaveBeenCalled()
    expect(MOCK_AUTH_CONNECTOR.provider.syncTheme).toHaveBeenCalledWith({
      themeVariables: MOCK_THEME_SNAPSHOT.themeVariables,
      w3mThemeVariables: getW3mThemeVariables(
        MOCK_THEME_SNAPSHOT.themeVariables as ThemeVariables,
        MOCK_THEME_SNAPSHOT.themeMode as ThemeType
      )
    })
  })
})

describe('W3mApproveTransactionView - Iframe Positioning Logic', () => {
  let element: W3mApproveTransactionView
  let mockIframe: HTMLIFrameElement

  beforeEach(async () => {
    vi.resetAllMocks()

    mockIframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableEmbedded: false
    })

    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR)
    vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue(MOCK_THEME_SNAPSHOT)
    vi.spyOn(ModalController, 'subscribeKey').mockReturnValue(() => {})

    element = await fixture<W3mApproveTransactionView>(
      html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
    )

    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(MOCK_RECT)
  })

  it('should position iframe correctly for desktop view', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })

    await element.updateComplete

    const resizeObserver = element['bodyObserver'] as MockResizeObserver

    if (resizeObserver) {
      const mockEntries = [
        {
          contentBoxSize: [{ inlineSize: 1200, blockSize: 800 }]
        }
      ]
      await resizeObserver.triggerCallback(mockEntries)
    }

    expect(mockIframe.style.display).toBe('block')
    expect(mockIframe.style.width).toBe('360px')
    expect(mockIframe.style.left).toBe('calc(50% - 180px)')
    expect(mockIframe.style.top).toBe('calc(50% - 268px)')
    expect(mockIframe.style.bottom).toBe('unset')
  })

  it('should position iframe correctly for mobile view', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })

    await element.updateComplete

    const resizeObserver = element['bodyObserver'] as MockResizeObserver
    if (resizeObserver) {
      const mockEntries = [
        {
          contentBoxSize: [{ inlineSize: 400, blockSize: 600 }]
        }
      ]
      await resizeObserver.triggerCallback(mockEntries)
    }

    expect(mockIframe.style.display).toBe('block')
    expect(mockIframe.style.width).toBe('100%')
    expect(mockIframe.style.left).toBe('0px')
    expect(mockIframe.style.bottom).toBe('0px')
    expect(mockIframe.style.top).toBe('unset')
  })

  it('should position iframe correctly for embedded mode', async () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      enableEmbedded: true
    })

    vi.spyOn(global, 'setTimeout').mockImplementation((handler: TimerHandler) => {
      if (typeof handler === 'function') {
        handler()
      }
      return 0 as any
    })

    await element.updateComplete

    const resizeObserver = element['bodyObserver'] as MockResizeObserver
    if (resizeObserver) {
      const mockEntries = [
        {
          contentBoxSize: [{ inlineSize: 800, blockSize: 600 }]
        }
      ]
      await resizeObserver.triggerCallback(mockEntries)
    }

    expect(mockIframe.style.display).toBe('block')
    expect(mockIframe.style.left).toBe('100px')
    expect(mockIframe.style.top).toBe('200px')
    expect(mockIframe.style.width).toBe('400px')
    expect(mockIframe.style.height).toBe('600px')
  })

  it('should set ready state to true after positioning', async () => {
    await element.updateComplete

    const resizeObserver = element['bodyObserver'] as MockResizeObserver

    if (resizeObserver) {
      const mockEntries = [
        {
          contentBoxSize: [{ inlineSize: 1200, blockSize: 800 }]
        }
      ]
      await resizeObserver.triggerCallback(mockEntries)
    }

    expect(element.ready).toBe(true)
  })
})
