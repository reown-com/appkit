/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: ['../introduction.mdx', '../stories/**/*.@(ts)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
}
export default config
