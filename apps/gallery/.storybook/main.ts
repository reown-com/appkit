import { dirname, join } from 'path'

/** @type { import('@storybook/web-components-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    '@chromatic-com/storybook'
  ],
  core: {
    disableTelemetry: true
  },
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite'),
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
  `,
  docs: {
    defaultName: 'Docs'
  }
}

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
