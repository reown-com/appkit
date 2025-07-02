import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConnectionController, CoreHelperUtil, SendController } from '@reown/appkit-controllers'

import { W3mInputAddress } from '../../src/partials/w3m-input-address'

Element.prototype.animate = vi.fn().mockReturnValue({
  finished: Promise.resolve()
})

describe('W3mInputAddress', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: vi.fn(() => Promise.resolve(''))
      },
      writable: true
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should render with default state', async () => {
    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    expect(element.value).toBeUndefined()
    expect(element.inputElementRef.value).toBeDefined()
    expect(element.instructionElementRef.value).toBeDefined()
  })

  it('should render with initial value', async () => {
    const initialValue = '0x123'
    const element: W3mInputAddress = await fixture(
      html`<w3m-input-address .value=${initialValue}></w3m-input-address>`
    )

    expect(element.value).toBe(initialValue)
    expect(element.inputElementRef.value?.value).toBe(initialValue)
  })

  it('should handle paste functionality', async () => {
    const mockAddress = '0x123456789'
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'readText')
    clipboardSpy.mockResolvedValueOnce(mockAddress)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const pasteButton = element.shadowRoot?.querySelector('.paste') as HTMLElement
    pasteButton.click()

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(clipboardSpy).toHaveBeenCalled()
    expect(setReceiverAddressSpy).toHaveBeenCalledWith(mockAddress)
  })

  it('should handle input changes and ENS resolution', async () => {
    const mockAddress = '0x123456789'
    const mockEnsName = 'test.eth'
    const mockAvatar = 'https://avatar.url'

    vi.spyOn(ConnectionController, 'getEnsAddress').mockResolvedValue(mockAddress)
    vi.spyOn(ConnectionController, 'getEnsAvatar').mockResolvedValue(mockAvatar)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')
    const setReceiverProfileNameSpy = vi.spyOn(SendController, 'setReceiverProfileName')
    const setReceiverProfileImageUrlSpy = vi.spyOn(SendController, 'setReceiverProfileImageUrl')
    const setLoadingSpy = vi.spyOn(SendController, 'setLoading')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const input = element.inputElementRef.value as HTMLInputElement
    input.value = mockEnsName
    input.dispatchEvent(new InputEvent('input'))

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(setLoadingSpy).toHaveBeenCalledWith(true)
    expect(setReceiverAddressSpy).toHaveBeenCalledWith(mockAddress)
    expect(setReceiverProfileNameSpy).toHaveBeenCalledWith(mockEnsName)
    expect(setReceiverProfileImageUrlSpy).toHaveBeenCalledWith(mockAvatar)
    expect(setLoadingSpy).toHaveBeenCalledWith(false)
  })

  it('should handle input changes with non-ENS address', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)
    const mockAddress = '0x13aa2Eb0a99Af2F847119dC4Ac632fFe196d0B0f'

    vi.spyOn(ConnectionController, 'getEnsAddress').mockResolvedValue(undefined)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')
    const setReceiverProfileNameSpy = vi.spyOn(SendController, 'setReceiverProfileName')
    const setReceiverProfileImageUrlSpy = vi.spyOn(SendController, 'setReceiverProfileImageUrl')
    const setLoadingSpy = vi.spyOn(SendController, 'setLoading')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const input = element.inputElementRef.value as HTMLInputElement
    input.value = mockAddress
    input.dispatchEvent(new InputEvent('input'))

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(setLoadingSpy).toHaveBeenCalledWith(true)
    expect(setReceiverAddressSpy).toHaveBeenCalledWith(mockAddress)
    expect(setReceiverProfileNameSpy).toHaveBeenCalledWith(undefined)
    expect(setReceiverProfileImageUrlSpy).toHaveBeenCalledWith(undefined)
    expect(setLoadingSpy).toHaveBeenCalledWith(false)
  })

  it('should handle focus and blur events', async () => {
    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const box = element.shadowRoot?.querySelector('wui-flex') as HTMLElement
    box.click()
    await elementUpdated(element)

    // Verify the input is enabled and textarea is not disabled
    expect(element.inputElementRef.value?.disabled).toBe(false)
    const textarea = element.shadowRoot?.querySelector('textarea')
    expect(textarea?.disabled).toBe(false)
  })

  it('should handle nacho.ccmc resolution', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    const ccmcName = 'nacho.ccmc'

    vi.spyOn(ConnectionController, 'getEnsAddress').mockResolvedValue(mockAddress)
    vi.spyOn(ConnectionController, 'getEnsAvatar').mockResolvedValue(undefined)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')
    const setReceiverProfileNameSpy = vi.spyOn(SendController, 'setReceiverProfileName')
    const setLoadingSpy = vi.spyOn(SendController, 'setLoading')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const input = element.inputElementRef.value as HTMLInputElement
    input.value = ccmcName
    input.dispatchEvent(new InputEvent('input'))

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(setLoadingSpy).toHaveBeenCalledWith(true)
    expect(setReceiverAddressSpy).toHaveBeenCalledWith(mockAddress)
    expect(setReceiverProfileNameSpy).toHaveBeenCalledWith(ccmcName)
    expect(setLoadingSpy).toHaveBeenCalledWith(false)
  })

  it('should handle invalid.ccmc resolution failure', async () => {
    const ccmcName = 'invalid.ccmc'

    vi.spyOn(ConnectionController, 'getEnsAddress').mockResolvedValue(false)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')
    const setReceiverProfileNameSpy = vi.spyOn(SendController, 'setReceiverProfileName')
    const setLoadingSpy = vi.spyOn(SendController, 'setLoading')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const input = element.inputElementRef.value as HTMLInputElement
    input.value = ccmcName
    input.dispatchEvent(new InputEvent('input'))

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(setLoadingSpy).toHaveBeenCalledWith(true)
    expect(setReceiverAddressSpy).not.toHaveBeenCalled()
    expect(setReceiverProfileNameSpy).not.toHaveBeenCalled()
    expect(setLoadingSpy).toHaveBeenCalledWith(false)
  })

  it('should handle nacho.ccmc resolution on Solana chain', async () => {
    const mockSolanaAddress = '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgpU'
    const ccmcName = 'nacho.ccmc'

    vi.spyOn(ConnectionController, 'getEnsAddress').mockResolvedValue(mockSolanaAddress)
    vi.spyOn(ConnectionController, 'getEnsAvatar').mockResolvedValue(undefined)
    const setReceiverAddressSpy = vi.spyOn(SendController, 'setReceiverAddress')
    const setReceiverProfileNameSpy = vi.spyOn(SendController, 'setReceiverProfileName')
    const setLoadingSpy = vi.spyOn(SendController, 'setLoading')

    const element: W3mInputAddress = await fixture(html`<w3m-input-address></w3m-input-address>`)

    const input = element.inputElementRef.value as HTMLInputElement
    input.value = ccmcName
    input.dispatchEvent(new InputEvent('input'))

    await vi.runAllTimersAsync()
    await elementUpdated(element)

    expect(setLoadingSpy).toHaveBeenCalledWith(true)
    expect(setReceiverAddressSpy).toHaveBeenCalledWith(mockSolanaAddress)
    expect(setReceiverProfileNameSpy).toHaveBeenCalledWith(ccmcName)
    expect(setLoadingSpy).toHaveBeenCalledWith(false)
  })
})
