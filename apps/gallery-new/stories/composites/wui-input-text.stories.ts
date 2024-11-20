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
    warningText: '',
    showSubmitButton: false,
    loading: false
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
      ></wui-input-text
    ></gallery-container>`
  }
}
