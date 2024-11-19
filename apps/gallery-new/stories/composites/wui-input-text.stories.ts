import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-input-text'
import type { WuiInputText } from '@reown/appkit-ui-new/src/composites/wui-input-text'
import { html } from 'lit'
import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInputText>

export default {
  title: 'Composites/wui-input-text',
  args: {
    placeholder: 'Search wallet',
    icon: 'search',
    disabled: false,
    errorText: '',
    warningMessage: '',
    onSubmit: () => {
      alert('Input submitted')
    }
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
    warningMessage: {
      control: { type: 'text' }
    },
    onSubmit: {
      control: { type: 'function' }
    }
  }
} as Component

export const Default: Component = {
  render: args => {
    let inputValue = args.value

    const handleInputChange = (e: CustomEvent<string>) => {
      inputValue = e.detail
      console.log('Input value changed:', inputValue)
    }

    return html`<gallery-container width="336">
      <wui-input-text
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        .icon=${args.icon}
        .errorText=${args.errorText}
        .warningMessage=${args.warningMessage}
        .value=${inputValue}
        .onSubmit=${args.onSubmit ? () => alert('Submit clicked!') : undefined}
        @inputChange=${handleInputChange}
      ></wui-input-text
    ></gallery-container>`
  }
}
