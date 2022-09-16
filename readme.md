## Package overview

- `packages/core` - Contains core logic and web-component ui
- `packages/react` - Exposes core package as react components and hooks
- `chains/ethereum` - Handles EIP155 chain logic

## Development workflow

1. Install deps across all packages by running `npm install` from the root
2. Run `npm run dev` to build and watch for changes in ui, core and ethereum packages
3. Run `npm run dev:html` to start html example (⚠️ wip)
4. Run `npm run dev:react` to start react example

## Suggested VSCode extensions

Following are suggested extensions to enable syntax highlighting, formating and checks inside lit's `html` and `css` template string literals.

- [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)
