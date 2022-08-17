## Package overview

- `packages/core` - Contains core logic and web-component ui
- `packages/react` - Exposes core package as react components and hooks
- `chains/ethereum` - Handles EIP155 chain logic

## Development workflow

1. Install deps across all packages by running `npm install` from the root
2. Run `npm run dev` within `packages/core` to bundle in watch mode
3. Run `npm run dev` within `examples/html` to start local preview on localhost:8080
4. Changes in `packages/core` are re-built automatically, so just refresh html example page to reflect them

## Suggested VSCode extensions

Following are suggested extensions to enable syntax highlighting and formating inside lit's `html` and `css` template string literals.

[lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html)
[es6-string-css](https://marketplace.visualstudio.com/items?itemName=bashmish.es6-string-css)
