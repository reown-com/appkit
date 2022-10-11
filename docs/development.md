# Development

## Workspace setup

Install dependencies from the repository's root directory (this will also set up each workspace):

```bash
yarn
```

Common commands:

- `yarn dev` - Build and watch all packages for changes simultaneously.
- `yarn build` - Build all packages + examples.
- `yarn lint` - Run the linter.
- `yarn prettier` - Run prettier.

## React Example

### Configuration

Create your own `.env.local` file and add your ProjectID from [cloud.walletconnect.com](https://cloud.walletconnect.com/):

```bash
# 1. change into example directory
cd ./examples/react
# 2. Copy the template env file
cp .env.local.example .env.local
# 3. Replace the NEXT_PUBLIC_PROJECT_ID placeholder inside `.env.local` with your own projectId
```

Bild packages in dev:

```bash
yarn dev
```

Run the examples:

```bash
yarn dev:react
yarn dev:html
```

### Reflecting local package changes

Via symlinking:

```bash
# 1. Set up the package for symlinking
cd packages/core
yarn link

# 2. Symlink the demo to our local copy of the package.
cd examples/react
yarn link "@web3modal/core"

# 3. Changes made to `packages/core` should now reflect in the app.
```
