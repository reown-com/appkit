import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ModalController } from '../../src/controllers/ModalController'
import { RouterController } from '../../src/controllers/RouterController'
import { RouterUtil } from '../../src/utils/RouterUtil'

// Mock the RouterController and ModalController
vi.mock('../../src/controllers/RouterController', () => ({
  RouterController: {
    state: {
      history: []
    },
    goBack: vi.fn(),
    goBackToIndex: vi.fn()
  }
}))

vi.mock('../../src/controllers/ModalController', () => ({
  ModalController: {
    close: vi.fn()
  }
}))

describe('RouterUtil', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('goBackOrCloseModal', () => {
    it('should call RouterController.goBack when history length is greater than 1', () => {
      RouterController.state.history = ['Account', 'Connect']
      RouterUtil.goBackOrCloseModal()
      expect(RouterController.goBack).toHaveBeenCalled()
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should call ModalController.close when history length is 1 or less', () => {
      RouterController.state.history = ['Account']
      RouterUtil.goBackOrCloseModal()
      expect(RouterController.goBack).not.toHaveBeenCalled()
      expect(ModalController.close).toHaveBeenCalled()
    })
  })

  describe('navigateAfterNetworkSwitch', () => {
    it('should call RouterController.goBackToIndex when Networks page is in history', () => {
      RouterController.state.history = ['Account', 'Networks', 'Connect']
      RouterUtil.navigateAfterNetworkSwitch()
      expect(RouterController.goBackToIndex).toHaveBeenCalledWith(0)
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should call ModalController.close when Networks page is not in history', () => {
      RouterController.state.history = ['Account', 'Connect']
      RouterUtil.navigateAfterNetworkSwitch()
      expect(RouterController.goBackToIndex).not.toHaveBeenCalled()
      expect(ModalController.close).toHaveBeenCalled()
    })

    it('should call ModalController.close when Networks is the first page in history', () => {
      RouterController.state.history = ['Networks', 'Account', 'Connect']
      RouterUtil.navigateAfterNetworkSwitch()
      expect(RouterController.goBackToIndex).not.toHaveBeenCalled()
      expect(ModalController.close).toHaveBeenCalled()
    })
  })
})
