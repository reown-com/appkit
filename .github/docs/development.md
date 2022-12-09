# Development

## Workspace setup

Install dependencies from the repository's root directory (this will also set up each workspace):

```bash
yarn
```

## .env.local file setup

Some examples have `.env.local.example` files. Copy their content and create new `.env.local` files in the same directory.
Without these `yarn:build` command will fail. To create your ProjectID head to [cloud.walletconnect.com](https://cloud.walletconnect.com/)

## Commands:

- `yarn build` - Build all packages.
- `yarn dev` - Build and watch all packages for changes.
- `yarn dev:react` - Run react example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:react-standalone` - Run react standalone example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:html` - Run plain html/js example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn build` - Build all packages + examples.
- `yarn lint` - Run the linter.
- `yarn prettier` - Run prettier.
- `yarn typecheck` - Run typescript checks.
