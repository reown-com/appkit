# Development

## Workspace setup

Install dependencies from the repository's root directory (this will also set up each workspace):

```bash
yarn
```

## Commands:

- `yarn dev` - Build and watch all packages for changes.
- `yarn dev:react` - Run react example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn dev:html` - Run plain html/js example (has to be ran together with `yarn dev` in a separate terminal tab).
- `yarn build` - Build all packages + examples.
- `yarn lint` - Run the linter.
- `yarn prettier` - Run prettier.
- `yarn typecheck` - Run typescript checks.

## React Example

### Configuration

Inside `examples/react` folder, rename `.env.local.example` to `.env.local` and add your ProjectID from [cloud.walletconnect.com](https://cloud.walletconnect.com/)
