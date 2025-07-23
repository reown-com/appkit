import { createElement } from 'react'

import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppKitProvider, type AppKitProviderProps } from '../../src/library/react/providers'

let mod: typeof import('../../exports/react')

describe('AppKitProvider', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mod = await import('../../exports/react')
    vi.spyOn(mod, 'createAppKit')
  })

  it('should call createAppKit with the correct parameters', () => {
    const props = {
      projectId: 'test',
      networks: [],
      children: 'child'
    } as unknown as AppKitProviderProps

    const { rerender } = render(
      createElement(AppKitProvider, props, createElement('div', null, 'child'))
    )

    delete props.children

    expect(mod.createAppKit).toHaveBeenCalledTimes(1)
    expect(mod.createAppKit).toHaveBeenCalledWith(props)

    rerender(createElement('div', null, 'child'))

    expect(mod.createAppKit).toHaveBeenCalledTimes(1)
  })
})
