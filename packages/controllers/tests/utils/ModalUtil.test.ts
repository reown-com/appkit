import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ModalController } from '../../src/controllers/ModalController.js'
import { RouterController } from '../../src/controllers/RouterController.js'
import { ModalUtil } from '../../src/utils/ModalUtil.js'
import { SIWXUtil } from '../../src/utils/SIWXUtil.js'

vi.mock('../../src/controllers/ModalController', () => ({
  ModalController: {
    shake: vi.fn(),
    close: vi.fn()
  }
}))

vi.mock('../../src/controllers/RouterController', () => ({
  RouterController: {
    state: {
      view: 'Connect',
      history: []
    }
  }
}))

vi.mock('../../src/utils/SIWXUtil', () => ({
  SIWXUtil: {
    isSIWXCloseDisabled: vi.fn()
  }
}))

describe('ModalUtil', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    RouterController.state.view = 'Connect'
    RouterController.state.history = []
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isUnsupportedChainView', () => {
    it('should return true when view is UnsupportedChain', () => {
      RouterController.state.view = 'UnsupportedChain'
      expect(ModalUtil.isUnsupportedChainView()).toBe(true)
    })

    it('should return true when view is SwitchNetwork and history includes UnsupportedChain', () => {
      RouterController.state.view = 'SwitchNetwork'
      RouterController.state.history = ['UnsupportedChain', 'Connect']
      expect(ModalUtil.isUnsupportedChainView()).toBe(true)
    })

    it('should return false when view is SwitchNetwork but history does not include UnsupportedChain', () => {
      RouterController.state.view = 'SwitchNetwork'
      RouterController.state.history = ['Connect']
      expect(ModalUtil.isUnsupportedChainView()).toBe(false)
    })

    it('should return false for other views', () => {
      RouterController.state.view = 'Connect'
      expect(ModalUtil.isUnsupportedChainView()).toBe(false)
    })
  })

  describe('safeClose', () => {
    it('should shake and not close when in UnsupportedChain view', async () => {
      RouterController.state.view = 'UnsupportedChain'
      await ModalUtil.safeClose()
      expect(ModalController.shake).toHaveBeenCalled()
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should shake and not close when in SwitchNetwork view with UnsupportedChain history', async () => {
      RouterController.state.view = 'SwitchNetwork'
      RouterController.state.history = ['UnsupportedChain']
      await ModalUtil.safeClose()
      expect(ModalController.shake).toHaveBeenCalled()
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should shake and not close when SIWX close is disabled', async () => {
      RouterController.state.view = 'Connect'
      vi.mocked(SIWXUtil.isSIWXCloseDisabled).mockResolvedValue(true)
      await ModalUtil.safeClose()
      expect(ModalController.shake).toHaveBeenCalled()
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should close when no conditions prevent closing', async () => {
      RouterController.state.view = 'Connect'
      vi.mocked(SIWXUtil.isSIWXCloseDisabled).mockResolvedValue(false)
      await ModalUtil.safeClose()
      expect(ModalController.shake).not.toHaveBeenCalled()
      expect(ModalController.close).toHaveBeenCalled()
    })
  })
})
