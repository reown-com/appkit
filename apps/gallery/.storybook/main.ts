/** @type { import('@storybook/web-components-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    'storybook/addon-essentials',
    '@chromatic-com/storybook'
  ],
  core: {
    disableTelemetry: true
  },
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  managerHead: head => `
  ${head}
    <style>
      a[data-nodetype='story'] {
        display: none;
      }
    </style>
  `,
  previewHead: head => `
  ${head}
    <style>
      .docblock-code-toggle {
        display: none !important;
      }
    </style>
  `
}
