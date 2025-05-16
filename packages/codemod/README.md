# Reown AppKit Codemod

**AppKit Codemod** is a command-line tool designed to update dependencies across multiple `package.json` files in AppKit monorepo efficiently.

### Codemod Features

The codemod tool allows you to update dependencies across multiple `package.json` files in your project. It supports:

- **Multiple Package Updates**: Pass multiple package names to update them all at once.
- **Wildcard Patterns**: Use patterns like `@walletconnect/*` to update all packages under a specific organization.
- **Version Constraint Preservation**: Maintains version constraints like `">=4.x.x"` when updating.

## Usage

You can use the Codemod globally using npx/pnpx:

```bash
pnpx @reown/appkit-codemod <process> <args...>
```

### Options

- `upgrade`: Updates dependencies to their latest versions across the monorepo.
  - **Arguments**: One or more package names to upgrade, separated by spaces. Supports wildcards like `@org/*`.

Or you can use the predefined scripts for local usage in the root of the monorepo:

```bash
pnpm codemod:wc # This will upgrade all the @walletconnect/* dependencies
```

### Example Commands

To update dependencies using the codemod:

```bash
npx appkit-codemod wagmi @wagmi/core @walletconnect/utils
npx appkit-codemod @walletconnect/*
```
