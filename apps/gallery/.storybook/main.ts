/** @type { import('@storybook/web-components-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  core: {
    disableTelemetry: true
  },
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  docs: {
    autodocs: true,
    defaultName: 'Docs'
  }
}
