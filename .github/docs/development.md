# Development

## Workspace setup

Install dependencies from the repository's root directory (this will also set up each workspace):

```bash
yarn
```

## .env.local file setup

Some examples have `.env.local.example` files. Copy their content and create new `.env.local` files in the same directory.
Without these `yarn:build` command will fail. To create your ProjectID head to [cloud.walletconnect.com](https://cloud.walletconnect.com/)

## Commands

Please execute all commands from the monorepo root to avoid issues with yarn workspaces. Running `build` command is required if this is your first time setting up the monorepo.

- `yarn build` - Build all packages.
- `yarn dev` - Build and watch all packages for changes.
- `yarn dev:nextjs` - Run nextjs example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:nextjs-standalone` - Run nextjs standalone example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn: dev:cra` - Run create-react-app example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:html` - Run plain html/js example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:html-standalone` - Run plain html/js standalone example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn lint` - Run the linter.
- `yarn prettier` - Run prettier.
- `yarn typecheck` - Run typescript checks.

## Repository structure

- `chains` - Helper packages for managed chain workflows
- `examples` - Contains examples for all supported use cases, acts as testing ground
- `packages`
  - `core` - State, proxy between ui and chain packages
  - `ui` - Web-components based ui of web3modal
    - `components` - Basic ui components
    - `partials` - Complex ui pieces composing multiple components and accessing core
    - `views` - Full web3modal views
  - `react` - React wrapper on top of core and ui
  - `html` - Vanilla html / js wrapper on top of core and ui
