import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-input-text'
import type { WuiInputText } from '@reown/appkit-ui/wui-input-text'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInputText & { showSubmitButton: boolean }>

export default {
  title: 'Composites/appkit-wui-input-text',
  args: {
    placeholder: 'Search wallet',
    icon: 'search',
    disabled: false,
    errorText: '',
    warningText: '',
    showSubmitButton: false,
    loading: false,
    size: 'md'
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    errorText: {
      control: { type: 'text' }
    },
    warningText: {
      control: { type: 'text' }
    },
    showSubmitButton: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    size: {
      options: ['md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => {
    let inputValue = args.value

    function handleInputChange(e: CustomEvent<string>) {
      inputValue = e.detail
    }

    function handleSubmit() {
      // eslint-disable-next-line no-alert
      alert('Input submitted')
    }

    return html`<gallery-container width="336">
      <wui-input-text
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        .icon=${args.icon}
        .errorText=${args.errorText}
        .warningText=${args.warningText}
        .value=${inputValue}
        .onSubmit=${args.showSubmitButton ? handleSubmit : undefined}
        @inputChange=${handleInputChange}
        size=${args.size}
      ></wui-input-text
    ></gallery-container>`
  }
}
